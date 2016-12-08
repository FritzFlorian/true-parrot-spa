import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";
import {EventAggregator} from "aurelia-event-aggregator";
import {FlashMessage} from "../../services/messages";

@autoinject()
export class UserCard {
  service: TwitterCloneService;
  user: User;
  currentUser: User;
  ea: EventAggregator;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  activate(model) {
    this.user = model.user;

    if (model.userId) {
      this.service.getUserProfile(model.userId).then((user) => {
        this.user = user;
      });
    }
  }

  attached() {
    this.currentUser = this.service.currentUser;

    runJquery();
  }

  deleteUser() {
    this.service.deleteUser(this.user.id).then((users:User[]) => {
      this.ea.publish(new FlashMessage("User Deleted").displayNow());
    });
  }

  deleteUserTweets() {
    console.log('delete tweets');
  }
}
