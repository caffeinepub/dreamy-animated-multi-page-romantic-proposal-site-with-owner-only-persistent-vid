import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import Array "mo:core/Array";

import Nat "mo:core/Nat";

actor {
  type Comment = {
    text : Text;
    used : Bool;
  };

  type CommentList = {
    name : Text;
    comments : List.List<Comment>;
  };

  type CommentListSummary = {
    name : Text;
    totalComments : Nat;
    usedComments : Nat;
  };

  type BulkCommentTotals = {
    totalLists : Nat;
    totalComments : Nat;
    usedComments : Nat;
    unusedComments : Nat;
  };

  type BulkCommentResult = {
    comments : [Text];
    usedCount : Nat;
    availableCount : Nat;
  };

  let commentLists = Map.empty<Text, CommentList>();
  let singleUseTracker = Map.empty<Text, ()>();

  // CUSTOMER VIEW
  public query ({ caller }) func getAvailableCommentLists() : async [Text] {
    // No authorization check needed - available to all including guests
    var result = List.empty<Text>();
    for ((name, _list) in commentLists.entries()) {
      result.add(name);
    };
    result.toArray();
  };

  public query ({ caller }) func getCommentListSummary(listName : Text) : async ?CommentListSummary {
    // No authorization check needed - available to all including guests
    switch (commentLists.get(listName)) {
      case (null) { null };
      case (?list) {
        var total = 0;
        var used = 0;
        for (comment in list.comments.values()) {
          total += 1;
          if (comment.used) { used += 1 };
        };
        ?{
          name = list.name;
          totalComments = total;
          usedComments = used;
        };
      };
    };
  };

  public shared ({ caller }) func generateSingleComment(listName : Text, deviceId : Text) : async Text {
    // No authorization check needed - available to all including guests
    let trackerKey = listName # "_" # deviceId;

    if (singleUseTracker.containsKey(trackerKey)) {
      Runtime.trap("Each device can only generate one comment per list");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        for (comment in list.comments.values()) {
          if (not comment.used) {
            let updatedComment : Comment = { comment with used = true };
            let updatedComments = list.comments.map<Comment, Comment>(
              func(c) {
                if (c.text == comment.text and not c.used) { updatedComment } else { c };
              }
            );
            let updatedList = { list with comments = updatedComments };
            commentLists.add(listName, updatedList);

            singleUseTracker.add(trackerKey, ());
            return updatedComment.text;
          };
        };
        Runtime.trap("All comments in this list are used");
      };
    };
  };

  public shared ({ caller }) func generateBulkComments(listName : Text, count : Nat, accessKey : Text) : async BulkCommentResult {
    // Authorization via access key - no role check needed
    switch (bulkGeneratorKey) {
      case (null) {
        Runtime.trap("Bulk generator access key not configured");
      };
      case (?stored) {
        if (stored.key != accessKey) {
          Runtime.trap("Invalid access key");
        };
      };
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        let comments : List.List<Text> = List.empty<Text>();
        var collected = 0;
        var totalUsed = 0;

        let updatedComments = List.empty<Comment>();

        for (comment in list.comments.values()) {
          if (collected < count and not comment.used) {
            comments.add(comment.text);
            updatedComments.add({ comment with used = true });
            collected += 1;
            totalUsed += 1;
          } else {
            updatedComments.add(comment);
            if (comment.used) { totalUsed += 1 };
          };
        };

        if (comments.size() == 0) {
          Runtime.trap("No available comments in list");
        };

        let updatedList = { list with comments = updatedComments };
        commentLists.add(listName, updatedList);

        {
          comments = comments.toArray();
          usedCount = totalUsed;
          availableCount = collected;
        };
      };
    };
  };

  public query ({ caller }) func getBulkCommentTotals() : async BulkCommentTotals {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view bulk comment totals");
    };

    var totalLists = 0;
    var totalComments = 0;
    var usedComments = 0;
    var unusedComments = 0;

    for ((_, list) in commentLists.entries()) {
      totalLists += 1;
      for (comment in list.comments.values()) {
        totalComments += 1;
        if (comment.used) { usedComments += 1 } else {
          unusedComments += 1;
        };
      };
    };

    {
      totalLists;
      totalComments;
      usedComments;
      unusedComments;
    };
  };

  // ADMIN COMMENT MANAGEMENT
  public shared ({ caller }) func createCommentList(name : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can create lists");
    };

    if (commentLists.containsKey(name)) {
      Runtime.trap("List with this name already exists");
    };

    let newList = {
      name;
      comments = List.empty<Comment>();
    };
    commentLists.add(name, newList);
  };

  public shared ({ caller }) func addSingleComment(listName : Text, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add comments");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        let newComment = {
          text = comment;
          used = false;
        };
        let updatedComments = list.comments;
        updatedComments.add(newComment);
        let updatedList = { list with comments = updatedComments };
        commentLists.add(listName, updatedList);
      };
    };
  };

  public shared ({ caller }) func bulkUploadComments(listName : Text, comments : [Text]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add comments");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        let updatedComments = list.comments;
        for (comment in comments.values()) {
          let newComment = {
            text = comment;
            used = false;
          };
          updatedComments.add(newComment);
        };
        let updatedList = { list with comments = updatedComments };
        commentLists.add(listName, updatedList);
      };
    };
  };

  public shared ({ caller }) func resetList(listName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset lists");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        let resetComments = list.comments.map<Comment, Comment>(
          func(comment) {
            { comment with used = false };
          }
        );
        let updatedList = { list with comments = resetComments };
        commentLists.add(listName, updatedList);
      };
    };
  };

  public shared ({ caller }) func deleteList(listName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete lists");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?_) {
        commentLists.remove(listName);
      };
    };
  };

  public shared ({ caller }) func deleteComment(listName : Text, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete comments");
    };

    switch (commentLists.get(listName)) {
      case (null) {
        Runtime.trap("List not found");
      };
      case (?list) {
        let filtered = list.comments.filter(
          func(c) { c.text != comment }
        );
        let updatedList = { list with comments = filtered };
        commentLists.add(listName, updatedList);
      };
    };
  };

  public query ({ caller }) func getCommentList(listName : Text) : async ?[Comment] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view comment details");
    };

    switch (commentLists.get(listName)) {
      case (null) { null };
      case (?list) {
        ?list.comments.toArray();
      };
    };
  };

  // BULK GENERATOR ACCESS KEY MANAGEMENT
  type BulkGeneratorKey = {
    key : Text;
  };

  var bulkGeneratorKey : ?BulkGeneratorKey = null;

  public query ({ caller }) func hasBulkGeneratorKey() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can check key status");
    };

    switch (bulkGeneratorKey) {
      case (null) { false };
      case (?_) { true };
    };
  };

  public query ({ caller }) func getBulkGeneratorKeyMasked() : async ?Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view key");
    };

    switch (bulkGeneratorKey) {
      case (null) { null };
      case (?stored) {
        let keyLength = stored.key.size();
        if (keyLength <= 4) {
          ?("****" # stored.key);
        } else {
          let chars = stored.key.toArray();
          let len = keyLength;
          if (len >= 4) {
            let lastFour = chars.sliceToArray(len - 4, len).toText();
            ?("********" # lastFour);
          } else {
            ?("********");
          };
        };
      };
    };
  };

  public shared ({ caller }) func setBulkGeneratorKey(newKey : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set bulk generator key");
    };

    bulkGeneratorKey := ?{
      key = newKey;
    };
  };

  public shared ({ caller }) func resetBulkGeneratorKey() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset bulk generator key");
    };

    bulkGeneratorKey := null;
  };

  // RATING IMAGE UPLOAD MANAGEMENT
  type RatingImage = {
    uploaderName : Text;
    uploadTime : Int;
    imageBlob : Storage.ExternalBlob;
  };

  let ratingImages = List.empty<RatingImage>();

  public shared ({ caller }) func uploadRatingImage(
    uploaderName : Text,
    image : Storage.ExternalBlob,
  ) : async () {
    // No authorization check - available to all including guests
    // This is a public submission feature
    let now = Time.now();
    let newImage : RatingImage = {
      uploaderName;
      uploadTime = now;
      imageBlob = image;
    };
    ratingImages.add(newImage);
  };

  public query ({ caller }) func getAllRatingImages() : async [RatingImage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view uploaded images");
    };

    ratingImages.toArray();
  };

  public shared ({ caller }) func deleteRatingImage(index : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete images");
    };

    let tempList = List.empty<RatingImage>();
    var currentIndex = 0;
    for (item in ratingImages.values()) {
      if (currentIndex != index) {
        tempList.add(item);
      };
      currentIndex += 1;
    };

    ratingImages.clear();
    for (item in tempList.reverse().values()) {
      ratingImages.add(item);
    };
  };

  // CHAT MANAGEMENT
  type ChatMessage = {
    sender : Text;
    timestamp : Int;
    message : Text;
  };

  let chatMessages = List.empty<ChatMessage>();

  public shared ({ caller }) func addChatMessage(
    sender : Text,
    message : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add chat messages");
    };

    let now = Time.now();
    let newMsg : ChatMessage = {
      sender;
      message;
      timestamp = now;
    };
    chatMessages.add(newMsg);
  };

  public query ({ caller }) func getAllChatMessages() : async [ChatMessage] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view chat messages");
    };

    chatMessages.toArray();
  };

  // USER PROFILE MANAGEMENT
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // LIVE LIST CHECKING SECTION
  type LiveListApp = {
    appName : Text;
    usernames : List.List<Text>;
  };

  type LiveListCheckResult = {
    appName : Text;
    matches : [Text];
    matchCount : Nat;
  };

  type LiveListCheckSummary = {
    totalMatches : Nat;
    detailedResults : [LiveListCheckResult];
  };

  let liveListApps = Map.empty<Text, LiveListApp>();

  // ADMIN SECTION FOR LIVE LIST
  public shared ({ caller }) func addLiveListApp(appName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add live list apps");
    };

    if (liveListApps.containsKey(appName)) {
      Runtime.trap("App with this name already exists");
    };

    let newApp = {
      appName;
      usernames = List.empty<Text>();
    };
    liveListApps.add(appName, newApp);
  };

  public shared ({ caller }) func addUsernamesToApp(appName : Text, newUsernames : [Text]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can add usernames");
    };

    switch (liveListApps.get(appName)) {
      case (null) {
        Runtime.trap("App not found");
      };
      case (?app) {
        for (username in newUsernames.values()) {
          app.usernames.add(username);
        };
      };
    };
  };

  public shared ({ caller }) func deleteLiveListApp(appName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can delete apps");
    };

    switch (liveListApps.get(appName)) {
      case (null) {
        Runtime.trap("App not found");
      };
      case (?_) {
        liveListApps.remove(appName);
      };
    };
  };

  public shared ({ caller }) func resetUsernamesForApp(appName : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset usernames");
    };

    switch (liveListApps.get(appName)) {
      case (null) {
        Runtime.trap("App not found");
      };
      case (?existingApp) {
        let updatedApp = {
          existingApp with usernames = List.empty<Text>();
        };
        liveListApps.add(appName, updatedApp);
      };
    };
  };

  public shared ({ caller }) func resetAllLiveListApps() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can reset all apps");
    };

    liveListApps.clear();
  };

  public query ({ caller }) func getAvailableLiveListApps() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view available apps");
    };

    var result = List.empty<Text>();
    for ((appName, _) in liveListApps.entries()) {
      result.add(appName);
    };
    result.toArray();
  };

  // LIVE LIST CHECKING FUNCTIONS
  public query ({ caller }) func checkLiveList(usernamesToCheck : [Text]) : async LiveListCheckSummary {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can perform live list checks");
    };

    var totalMatches = 0;
    let detailedResults = List.empty<LiveListCheckResult>();

    for ((_, app) in liveListApps.entries()) {
      var matchCount = 0;
      let matches = List.empty<Text>();

      for (username in app.usernames.values()) {
        for (checkUser in usernamesToCheck.values()) {
          if (username == checkUser) {
            matches.add(username);
            matchCount += 1;
            totalMatches += 1;
          };
        };
      };

      detailedResults.add({
        appName = app.appName;
        matches = matches.toArray();
        matchCount;
      });
    };

    {
      totalMatches;
      detailedResults = detailedResults.toArray();
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();
};
