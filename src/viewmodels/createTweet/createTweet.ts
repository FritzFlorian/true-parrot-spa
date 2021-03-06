import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import TwitterCloneService from "../../services/twitterCloneService";
import {ServiceError} from "../../services/twitterCloneService";
import Tweet from "../../services/tweet";
import {EventAggregator} from "aurelia-event-aggregator";
import {FlashMessage} from "../../services/messages";

@autoinject()
export class Login {
  service: TwitterCloneService;
  message: string;
  files: string;
  router: Router;
  formErrors: any[];
  ea: EventAggregator;
  loading: boolean = false;

  constructor(service:TwitterCloneService, router:Router, ea:EventAggregator) {
    this.service = service;
    this.router = router;
    this.ea = ea;
    this.formErrors = [];
  }

  tweet() {
    this.loading = true;

    let image = null;
    if (this.files) {
      image = this.files[0];
    }

    this.service.createTweet(this.message, image).then((result:Tweet) => {
      this.ea.publish(new FlashMessage("Tweet Created"));
      this.router.navigateToRoute('tweets');

      this.loading = false;
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;

      this.loading = false;
    });
  }

  attached() {
    runJquery();
  }
}
