import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus} from "../../services/messages";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";

@autoinject()
export class HeaderMenu {
  service: TwitterCloneService;
  ea: EventAggregator;

  loggedIn: boolean;
  currentUser: User;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;

    ea.subscribe(LoginStatus, (loginStatus:LoginStatus) => {
      this.currentUser = loginStatus.user;
      this.loggedIn = loginStatus.success;
    });
  }

  attached() {
    this.currentUser = this.service.currentUser;
    this.loggedIn = this.service.isAuthenticated();

    runJquery();
  }
}
