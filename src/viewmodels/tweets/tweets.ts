import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import Tweet from "../../services/tweet";
import User from "../../services/user";
import {TweetsChanged} from "../../services/messages";

@autoinject()
export class Tweets {
  service: TwitterCloneService;
  tweets: Tweet[];
  currentUser: User;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;

    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      this.tweets = message.tweets;
    });
    this.tweets = service.tweets;
    this.service.reloadTweets();

    this.currentUser = this.service.currentUser;
  }

  attached() {
    this.currentUser = this.service.currentUser;

    runJquery();
  }
}
