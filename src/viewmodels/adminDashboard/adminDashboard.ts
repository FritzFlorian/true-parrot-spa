import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged} from "../../services/messages";
import User from "../../services/user";

@autoinject()
export class AdminDashboard {
  service: TwitterCloneService;
  tweets: Tweet[];
  currentUser: User;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.currentUser = service.currentUser;

    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      this.setTweets(message.tweets);
    });
    this.service.reloadTweets();
  }

  setTweets(tweets:Tweet[]) {
    this.tweets = tweets.slice(0, 5);
  }

  attached() {
    this.setTweets(this.service.tweets);

    runJquery();
  }

}
