import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";
import {ServiceError} from "../../services/twitterCloneService";
import {FlashMessage} from "../../services/messages";
import {EventAggregator} from "aurelia-event-aggregator";

@autoinject()
export class Settings {
  service: TwitterCloneService;
  currentUser: User;
  ea:EventAggregator;

  email: string;
  firstName: string;
  lastName: string;
  password: string;
  description: string;

  formErrors: any[];

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  updateCurrentUser(user:User) {
    this.currentUser = user;

    this.email = this.currentUser.email;
    this.firstName = this.currentUser.firstName;
    this.lastName = this.currentUser.lastName;
    this.description = this.currentUser.description;
  }

  attached() {
    this.updateCurrentUser(this.service.currentUser);

    runJquery();
  }

  saveSettings() {
    this.service.updateSettings(this.email, this.firstName, this.lastName, this.description, this.password)
      .then((user) => {
        this.ea.publish(new FlashMessage("Settings Saved").displayNow());
      }).catch((error:ServiceError) => {
        this.formErrors = error.formErrors;
      });
  }
}
