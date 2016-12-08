import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import User from "../../services/user";

@autoinject()
export class UserCard {
  service: TwitterCloneService;
  user: User;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  activate(model) {
    this.user = model.user;

    if (model.userId) {
      this.service.getUserProfile(model.userId).then((user) => {
        this.user = user;
      });
    }
  }
}
