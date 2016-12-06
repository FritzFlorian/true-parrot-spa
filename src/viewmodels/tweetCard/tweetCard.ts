import User from "../../services/user";
import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {Router} from "aurelia-router";

@autoinject()
export class TweetCard {
  currentUser: User;
  tweet: Tweet;
  service: TwitterCloneService;
  router: Router;

  constructor(service:TwitterCloneService, router:Router) {
    this.service = service;
    this.router = router;
  }

  activate(model) {
    this.currentUser = model.currentUser;
    this.tweet = model.tweet;
  }

  delete() {
    this.service.deleteTweet(this.tweet);
  }

  parrot() {
    if (this.service.isAuthenticated()) {
      this.service.parrotTweet(this.tweet, true);
    } else {
      this.router.navigateToRoute('login');
    }
  }

  unParrot() {
    if (this.service.isAuthenticated()) {
      this.service.parrotTweet(this.tweet, false);
    } else {
      this.router.navigateToRoute('login');
    }
  }
}
