import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";
import User from "../../services/user";
import {EventAggregator} from "aurelia-event-aggregator";
import {TweetsChanged, UsersChanged} from "../../services/messages";

@autoinject()
export class Followers {
  service: TwitterCloneService;
  userId: string;
  user: User;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;

    ea.subscribe(UsersChanged, (message:UsersChanged) => {
      if (this.user) {
        this.updateUser(this.user.id);
      }
    });
  }

  updateUser(id) {
    this.service.getUser(id).then((user:User) => {
      this.user = user;
    });
  }

  activate(params) {
    this.updateUser(params.id);
    this.userId = params.id;
  }

  attached() {
    runJquery();
  }
}
