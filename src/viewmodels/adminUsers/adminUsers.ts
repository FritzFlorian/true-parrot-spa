import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {UsersChanged, FlashMessage} from "../../services/messages";
import User from "../../services/user";

@autoinject()
export class AdminUsers {
  service: TwitterCloneService;
  ea: EventAggregator;
  users: User[];
  currentUser: User;

  selectedUsers: any[] = [];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
    this.currentUser = service.currentUser;

    ea.subscribe(UsersChanged, (message:UsersChanged) => {
      this.users = message.users;
    });
    this.users = this.service.users;
    this.service.reloadTweets();
  }

  attached() {
    this.users = this.service.users;

    runJquery();
  }

  deleteSelected() {
    this.service.adminDeleteUsers(this.selectedUsers).then((message) => {
      this.ea.publish(new FlashMessage(message).displayNow());
    });
  }

}
