import User from "../../services/user";
import Tweet from "../../services/tweet";

export class TweetCard {
  currentUser: User;
  tweet: Tweet;

  activate(model) {
    console.log('activate');

    this.currentUser = model.currentUser;
    this.tweet = model.tweet;
  }
}
