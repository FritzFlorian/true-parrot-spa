import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";

@autoinject()
export class Login {
  service: TwitterCloneService;
  message: string;
  files: string;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  tweet() {
    let image = null;
    if (this.files) {
      image = this.files[0];
    }

    this.service.createTweet(this.message, image);
  }

  attached() {
    runJquery();
  }
}
