import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";

module {
  type OldComment = {
    text : Text;
    used : Bool;
  };

  type OldCommentList = {
    name : Text;
    comments : List.List<OldComment>;
  };

  type OldActor = {
    commentLists : Map.Map<Text, OldCommentList>;
  };

  type NewComment = {
    text : Text;
    used : Bool;
  };

  type NewCommentList = {
    name : Text;
    comments : List.List<NewComment>;
    locked : Bool;
  };

  type NewActor = {
    commentLists : Map.Map<Text, NewCommentList>;
  };

  public func run(old : OldActor) : NewActor {
    let newCommentLists = old.commentLists.map<Text, OldCommentList, NewCommentList>(
      func(_name, oldList) {
        { oldList with locked = false };
      }
    );
    { commentLists = newCommentLists };
  };
};
