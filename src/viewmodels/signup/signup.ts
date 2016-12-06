import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {ServiceError} from "../../services/twitterCloneService";
import {FlashMessage} from "../../services/messages";
import {EventAggregator} from "aurelia-event-aggregator";

@autoinject()
export class Signup {
  service: TwitterCloneService;
  ea: EventAggregator;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  description: string;

  formErrors: any[] = [];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  register(event) {
    this.service.register(this.email, this.password, this.firstName, this.lastName, this.description).then((result) => {
      this.ea.publish(new FlashMessage("Account Created"));
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;
    });
  }

  attached() {
    runJquery();
  }
}
