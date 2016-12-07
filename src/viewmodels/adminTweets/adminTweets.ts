import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged, UsersChanged} from "../../services/messages";
import User from "../../services/user";

@autoinject()
export class AdminDashboard {
  service: TwitterCloneService;
  tweets: Tweet[];
  currentUser: User;

  selectedTweets: any[] = [];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.currentUser = service.currentUser;

    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      this.tweets = message.tweets;
    });
    this.tweets = this.service.tweets;
    this.service.reloadTweets();
  }

  attached() {
    this.tweets = this.service.tweets;

    runJquery();
  }

  deleteSelected() {
    console.log(this.selectedTweets);
  }

}
