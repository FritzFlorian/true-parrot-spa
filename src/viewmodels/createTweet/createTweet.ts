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

  constructor(service:TwitterCloneService, router:Router, ea:EventAggregator) {
    this.service = service;
    this.router = router;
    this.ea = ea;
    this.formErrors = [];
  }

  tweet() {
    let image = null;
    if (this.files) {
      image = this.files[0];
    }

    this.service.createTweet(this.message, image).then((result:Tweet) => {
      this.router.navigateToRoute('tweets');
      this.ea.publish(new FlashMessage("Tweet Created1"));
      this.ea.publish(new FlashMessage("Tweet Created2"));
      this.ea.publish(new FlashMessage("Tweet Created3"));
      this.ea.publish(new FlashMessage("Tweet Created4"));
    }).catch((error:ServiceError) => {
      this.formErrors = error.formErrors;
    });
  }

  attached() {
    runJquery();
  }
}
