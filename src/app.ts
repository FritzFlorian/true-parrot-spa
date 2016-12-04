import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import {TwitterCloneService} from "./services/twitterCloneService";

@autoinject()
export class App {
  router: Router;
  service: TwitterCloneService;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  configureRouter(config, router:Router) {
    config.map([
      { route: '', name: 'header', moduleId: 'viewmodels/headeMenu/headerMenu', nav: true, title: 'Header' },
    ]);

    this.router = router;
  }
}
