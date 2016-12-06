import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {ServiceError} from "../../services/twitterCloneService";
import User from "../../services/user";
import {FlashMessage} from "../../services/messages";
import {EventAggregator} from "aurelia-event-aggregator";

@autoinject()
export class Login {
  service: TwitterCloneService;
  ea: EventAggregator;
  email: string;
  password: string;

  formErrors: any[];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  login(event) {
    this.service.login(this.email, this.password).then((user:User) => {
      this.ea.publish(new FlashMessage("Logged In"));
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;
    });
  }

  attached() {
    runJquery();
  }
}
