import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {ServiceError} from "../../services/twitterCloneService";
import User from "../../services/user";

@autoinject()
export class Login {
  service: TwitterCloneService;
  email: string;
  password: string;

  formErrors: any[];

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  login(event) {
    this.service.login(this.email, this.password).then((user:User) => {
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;
    });
  }

  attached() {
    runJquery();
  }
}
