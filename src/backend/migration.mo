import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    ratingImages : List.List<{
      uploaderName : Text;
      uploadTime : Int;
      imageBlob : Storage.ExternalBlob;
    }>;
    bulkGeneratorKey : ?{
      key : Text;
    };
    commentLists : Map.Map<Text, {
      name : Text;
      comments : List.List<{
        text : Text;
        used : Bool;
      }>;
    }>;
    chatMessages : List.List<{
      sender : Text;
      timestamp : Int;
      message : Text;
    }>;
    userProfiles : Map.Map<Principal, {
      name : Text;
    }>;
    liveListApps : Map.Map<Text, {
      appName : Text;
      usernames : List.List<Text>;
    }>;
  };

  type NewActor = {
    ratingImages : List.List<{
      uploaderName : Text;
      uploadTime : Int;
      imageBlob : Storage.ExternalBlob;
    }>;
    bulkGeneratorKey : ?{
      key : Text;
    };
    commentLists : Map.Map<Text, {
      name : Text;
      comments : List.List<{
        text : Text;
        used : Bool;
      }>;
    }>;
    chatMessages : List.List<{
      sender : Text;
      timestamp : Int;
      message : Text;
    }>;
    userProfiles : Map.Map<Principal, {
      name : Text;
    }>;
    liveListApps : Map.Map<Text, {
      appName : Text;
      usernames : List.List<Text>;
    }>;
    singleUseTracker : Map.Map<Text, ()>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      singleUseTracker = Map.empty<Text, ()>()
    };
  };
};
