import User from "./user";
import Tweet from "./tweet";
export class Profile {
  user: User;
  tweets: Tweet[];

  constructor(user:User, tweets:Tweet[]) {
    this.user = user;
    this.tweets = tweets;
  }
}
