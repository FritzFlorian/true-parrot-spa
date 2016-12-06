import User from "./user";
import Tweet from "./tweet";

export class LoginStatus {
  success: boolean;
  error: string;
  user: User;

  constructor(success: boolean, error:string, user: User) {
    this.success = success;
    this.error = error;
    this.user = user;
  }
}

export class TweetsChanged {
  tweets: Tweet[];

  constructor(tweets:Tweet[]) {
    this.tweets = tweets;
  }
}

export class FlashMessage {
  message: string;
  displayIn: number;

  constructor(message:string, displayIn:number = 1) {
    this.message = message;
    this.displayIn = displayIn;
  }

  get isDisplayed():boolean {
    return this.displayIn == 0;
  }
}

export class PageChanged { }
