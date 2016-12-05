import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";

@autoinject()
export class Signup {
  service: TwitterCloneService;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  register(event) {
    this.service.register(this.email, this.password, this.firstName, this.lastName, this.description);
  }
}
