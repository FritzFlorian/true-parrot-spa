import {autoinject} from "aurelia-framework";
import {TwitterCloneService} from "../../services/twitterCloneService";

@autoinject()
export class HeaderMenu {
  service: TwitterCloneService;
  loggedIn: boolean;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  attached() {
    this.loggedIn = this.service.isAuthenticated();
  }
}
