import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {Profile as ProfileModel} from "../../services/profile";

@autoinject()
export class Profile {
  service: TwitterCloneService;
  profile: ProfileModel;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  activate(params) {
    this.service.getUserProfile(params.id).then((profile:ProfileModel) => {
      this.profile = profile;
      runJquery();
    });
  }
}
