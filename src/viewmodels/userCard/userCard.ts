import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";
import {EventAggregator} from "aurelia-event-aggregator";
import {FlashMessage, UsersChanged} from "../../services/messages";

@autoinject()
export class UserCard {
  service: TwitterCloneService;
  user: User;
  currentUser: User;
  ea: EventAggregator;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;

    ea.subscribe(UsersChanged, (message:UsersChanged) => {
      this.reloadUserInfo(this.user.id);
    });
  }

  reloadUserInfo(id) {
    this.service.getUser(id).then((user) => {
      this.user = user;
      this.currentUser = this.service.currentUser;
    });
  }

  activate(model) {
    this.user = model.user;

    if (model.userId) {
      this.reloadUserInfo(model.userId);
    }
  }

  attached() {
    runJquery();
  }

  deleteUser() {
    this.service.deleteUser(this.user.id).then((users:User[]) => {
      this.ea.publish(new FlashMessage("User Deleted").displayNow());
    });
  }

  deleteUserTweets() {
    this.service.deleteTweetsByUser(this.user.id).then((message:string) => {
      this.ea.publish(new FlashMessage(message).displayNow());
    });
  }

  followUser() {
    this.service.updateFollowUser(this.user.id, true).then((users) => {
      this.ea.publish(new FlashMessage("Followed User").displayNow());
    });
  }

  unfollowUser() {
    this.service.updateFollowUser(this.user.id, false).then((users) => {
      this.ea.publish(new FlashMessage("Stopped following User").displayNow());
    });
  }
}
