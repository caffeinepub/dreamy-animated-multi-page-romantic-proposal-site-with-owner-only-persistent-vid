import Map "mo:core/Map";
import Text "mo:core/Text";
import List "mo:core/List";

module {
  type Comment = {
    text : Text;
    used : Bool;
  };

  type CommentList = {
    name : Text;
    comments : List.List<Comment>;
    locked : Bool;
  };

  type OldActor = {
    commentLists : Map.Map<Text, CommentList>;
  };

  type NewActor = {
    commentLists : Map.Map<Text, CommentList>;
  };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
