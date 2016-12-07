import Tweet from "../../services/tweet";
import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged, UsersChanged, FlashMessage} from "../../services/messages";
import User from "../../services/user";

@autoinject()
export class AdminTweets {
  service: TwitterCloneService;
  ea: EventAggregator;
  tweets: Tweet[];
  currentUser: User;

  selectedTweets: any[] = [];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
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
    this.service.adminDeleteTweets(this.selectedTweets).then((message) => {
      this.ea.publish(new FlashMessage(message).displayNow());
    });
  }

}
