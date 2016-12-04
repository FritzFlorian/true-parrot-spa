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
      { route: '', name: 'landing', moduleId: 'viewmodels/landing/landing', nav: true, title: 'Welcome' },
      { route: 'other', name: 'other', moduleId: 'viewmodels/headerMenu/headerMenu', nav: true, title: 'Other' },
    ]);

    this.router = router;
  }
}
