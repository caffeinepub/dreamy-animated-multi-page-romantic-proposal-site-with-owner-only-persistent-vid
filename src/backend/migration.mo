import Map "mo:core/Map";
import List "mo:core/List";
import Storage "blob-storage/Storage";

module {
  type OldActor = {
    liveEventsVar : Map.Map<Text, OldLiveEvent>;
    adminToken : Text;
  };

  type OldLiveEvent = {
    title : Text;
    description : Text;
    startTime : Int;
    endTime : Int;
    isActive : Bool;
    streamUrl : Text;
  };

  type NewActor = {
    commentLists : Map.Map<Text, CommentList>;
    bulkGeneratorKey : ?BulkGeneratorKey;
    ratingImages : List.List<RatingImage>;
    chatMessages : List.List<ChatMessage>;
  };

  type Comment = {
    text : Text;
    used : Bool;
  };

  type CommentList = {
    name : Text;
    comments : List.List<Comment>;
  };

  type BulkGeneratorKey = {
    key : Text;
  };

  type RatingImage = {
    uploaderName : Text;
    uploadTime : Int;
    imageBlob : Storage.ExternalBlob;
  };

  type ChatMessage = {
    sender : Text;
    timestamp : Int;
    message : Text;
  };

  public func run(_old : OldActor) : NewActor {
    let commentLists = Map.empty<Text, CommentList>();
    { commentLists; bulkGeneratorKey = null; ratingImages = List.empty<RatingImage>(); chatMessages = List.empty<ChatMessage>() };
  };
};
