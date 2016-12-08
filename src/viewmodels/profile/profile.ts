import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";
import User from "../../services/user";

@autoinject()
export class Profile {
  service: TwitterCloneService;
  tweets: Tweet[];
  userId: string;
  currentUser: User;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  activate(params) {
    this.service.getTweetsByUser(params.id).then((serviceTweets:Tweet[]) => {
      this.tweets = serviceTweets;
    });

    this.userId = params.id;
  }

  attached() {
    runJquery();
  }
}
