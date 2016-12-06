import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";

@autoinject()
export class Settings {
  service: TwitterCloneService;
  currentUser: User;

  email: string;
  firstName: string;
  lastName: string;
  password: string;
  description: string;

  constructor(service:TwitterCloneService) {
    this.service = service;
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
    this.service.updateSettings(this.email, this.firstName, this.lastName, this.description, this.password);
  }
}
