import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";

@autoinject()
export class Logout {
  service: TwitterCloneService;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  logout() {
    this.service.logout();
  }

  attached() {
    runJquery();
  }
}
