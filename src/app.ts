import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import TwitterCloneService from "./services/twitterCloneService";

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
      { route: 'login', name: 'login', moduleId: 'viewmodels/login/login', nav: true, title: 'Login' },
      { route: 'signup', name: 'signup', moduleId: 'viewmodels/signup/signup', nav: true, title: 'Signup' },
    ]);

    this.router = router;
  }
}
