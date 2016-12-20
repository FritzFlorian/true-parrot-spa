import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";
import User from "../../services/user";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged} from "../../services/messages";

@autoinject()
export class Profile {
  service: TwitterCloneService;
  tweets: Tweet[];
  userId: string;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;

    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      this.tweets = this.service.currentProfileTweets;
    });
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
