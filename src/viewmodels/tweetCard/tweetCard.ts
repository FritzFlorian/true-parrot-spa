import User from "../../services/user";
import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";

@autoinject()
export class TweetCard {
  currentUser: User;
  tweet: Tweet;
  service: TwitterCloneService;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  activate(model) {
    this.currentUser = model.currentUser;
    this.tweet = model.tweet;
  }

  delete() {
    this.service.deleteTweet(this.tweet);
  }
}
