import {autoinject} from "aurelia-framework";
import {TwitterCloneService} from "../../services/twitterCloneService";

@autoinject()
export class Login {
  service: TwitterCloneService;
  email: string;
  password: string;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  login(event) {
    this.service.login(this.email, this.password);
  }
}
