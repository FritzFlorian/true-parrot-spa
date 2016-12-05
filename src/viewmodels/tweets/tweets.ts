import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";
import User from "../../services/user";

@autoinject()
export class Tweets {
  service: TwitterCloneService;
  tweets: Tweet[];
  currentUser: User;

  constructor(service:TwitterCloneService) {
    this.service = service;
    this.tweets = service.tweets;
    this.service.reloadTweets();

    this.currentUser = this.service.currentUser;
  }

  attached() {
    this.currentUser = this.service.currentUser;

    runJquery();
  }
}
