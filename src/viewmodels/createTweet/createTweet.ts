import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import TwitterCloneService from "../../services/twitterCloneService";
import {ServiceError} from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";

@autoinject()
export class Login {
  service: TwitterCloneService;
  message: string;
  files: string;
  router: Router;
  formErrors: any[];

  constructor(service:TwitterCloneService, router:Router) {
    this.service = service;
    this.router = router;
    this.formErrors = [];
  }

  tweet() {
    let image = null;
    if (this.files) {
      image = this.files[0];
    }

    this.service.createTweet(this.message, image).then((result:Tweet) => {
      this.router.navigateToRoute('tweets');
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;
    });
  }

  attached() {
    runJquery();
  }
}
