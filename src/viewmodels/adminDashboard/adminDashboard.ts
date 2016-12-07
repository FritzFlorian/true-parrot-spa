import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged, UsersChanged, AdminStatsChanged} from "../../services/messages";
import User from "../../services/user";

@autoinject()
export class AdminDashboard {
  service: TwitterCloneService;
  tweets: Tweet[];
  users: User[];
  currentUser: User;
  stats: any;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.currentUser = service.currentUser;

    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      this.setTweets(message.tweets);
    });
    this.tweets = this.service.tweets;
    this.service.reloadTweets();

    ea.subscribe(UsersChanged, (message:UsersChanged) => {
      this.setUsers(message.users);
    });
    this.users = this.service.users;
    this.service.reloadUsers();

    ea.subscribe(AdminStatsChanged, (message:AdminStatsChanged) => {
      this.stats = message.stats;
    });
    this.stats = this.service.adminStats;
    this.service.reloadAdminStats();
  }

  setTweets(tweets:Tweet[]) {
    this.tweets = tweets.slice(0, 5);
  }

  setUsers(users:User[]) {
    this.users = users.slice(0, 5);
  }

  attached() {
    this.setTweets(this.service.tweets);
    this.setUsers(this.service.users);
    this.stats = this.service.adminStats;

    runJquery();
  }

}
