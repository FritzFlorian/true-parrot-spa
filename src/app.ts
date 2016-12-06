import {autoinject} from "aurelia-framework";
import {Router, Redirect} from "aurelia-router";
import TwitterCloneService from "./services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus} from "./services/messages";

@autoinject()
export class App {
  router: Router;
  service: TwitterCloneService;
  ea: EventAggregator;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;

    this.ea.subscribe(LoginStatus, (loginStatus:LoginStatus) => {
      if (loginStatus.success) {
        this.router.navigateToRoute('tweets');
      } else {
        this.router.navigateToRoute('landing');
      }
    });
  }

  configureRouter(config, router:Router) {
    const step = new AuthorizeStep();
    config.addAuthorizeStep(step);

    config.map([
      {
        route: 'logout',
        name: 'logout',
        moduleId: 'viewmodels/logout/logout',
        nav: true,
        title: "Logout",
      },
      {
        route: 'login',
        name: 'login',
        moduleId: 'viewmodels/login/login',
        nav: true,
        title: "Login",
      },
      {
        route: 'signup',
        name: 'signup',
        moduleId: 'viewmodels/signup/signup',
        nav: true,
        title: "Signup",
      },
      {
        route: '',
        name: 'landing',
        moduleId: 'viewmodels/landing/landing',
        nav: true,
        title: "Welcome",
      },
      {
        route: 'tweets',
        name: 'tweets',
        moduleId: 'viewmodels/tweets/tweets',
        nav: true,
        title: 'Tweets',
      },
    ]);

    this.router = router;
  }
}

/**
 * The authorize step will check if a creator should be allowed to access an route.
 * If not the creator will be redirected to a correct route.
 */
class AuthorizeStep {
  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      var isLoggedIn = false;
      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }
}
