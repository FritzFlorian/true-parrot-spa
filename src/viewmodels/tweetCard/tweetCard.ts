import User from "../../services/user";
import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {Router} from "aurelia-router";
import {FlashMessage} from "../../services/messages";
import {EventAggregator} from "aurelia-event-aggregator";

@autoinject()
export class TweetCard {
  currentUser: User;
  tweet: Tweet;
  service: TwitterCloneService;
  router: Router;
  ea: EventAggregator;

  constructor(service:TwitterCloneService, router:Router, ea:EventAggregator) {
    this.service = service;
    this.router = router;
    this.ea = ea;
  }

  activate(model) {
    this.currentUser = model.currentUser;
    this.tweet = model.tweet;
  }

  delete() {
    this.ea.publish(new FlashMessage("Tweet Deleted").displayNow());
    this.service.deleteTweet(this.tweet);
  }

  parrot() {
    if (this.service.isAuthenticated()) {
      this.ea.publish(new FlashMessage("Tweet Parroted").displayNow());
      this.service.parrotTweet(this.tweet, true);
    } else {
      this.router.navigateToRoute('login');
    }
  }

  unParrot() {
    if (this.service.isAuthenticated()) {
      this.ea.publish(new FlashMessage("Tweet Un-Parroted").displayNow());
      this.service.parrotTweet(this.tweet, false);
    } else {
      this.router.navigateToRoute('login');
    }
  }
}
