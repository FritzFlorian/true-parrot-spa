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
    const step = new AuthorizeStep(this.service);
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
      {
        route: 'settings',
        name: 'settings',
        moduleId: 'viewmodels/settings/settings',
        nav: true,
        settings: { auth: true },
        title: 'Settings',
      },
      {
        route: 'profile/:id',
        href: 'profile/:id',
        name: 'profile',
        moduleId: 'viewmodels/profile/profile',
        nav: true,
        title: 'Profile',
      },
      {
        route: 'tweet',
        name: 'tweet',
        moduleId: 'viewmodels/createTweet/createTweet',
        nav: true,
        settings: { auth: true },
        title: 'Tweet',
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
  service: TwitterCloneService;

  constructor(service:TwitterCloneService) {
    this.service = service;
  }

  run(navigationInstruction, next) {
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      var isLoggedIn = this.service.isAuthenticated;
      if (!isLoggedIn) {
        return next.cancel(new Redirect('login'));
      }
    }

    return next();
  }
}
