import {autoinject} from "aurelia-framework";
import {TwitterCloneService} from "../../services/twitterCloneService";
import {User} from "../../services/user";

@autoinject()
export class HeaderMenu {
  service: TwitterCloneService;

  loggedIn: boolean;
  currentUser: User;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  attached() {
    this.currentUser = this.service.currentUser;
    this.loggedIn = this.service.isAuthenticated();

    runJquery();
  }
}
