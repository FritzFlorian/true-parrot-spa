import {autoinject} from "aurelia-framework";
import {Router, Redirect} from "aurelia-router";
import TwitterCloneService from "./services/twitterCloneService";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus, PageChanged, FlashMessage} from "./services/messages";

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
        this.router.navigateToRoute("tweets");
      } else {
        this.router.navigateToRoute("landing");
      }
    });
  }

  configureRouter(config, router:Router) {
    const authStep = new AuthorizeStep(this.service, this.ea);
    config.addAuthorizeStep(authStep);
    const flashStep = new ClearFlashStep(this.ea);
    config.addPreActivateStep(flashStep);

    config.map([
      {
        route: "logout",
        name: "logout",
        moduleId: "viewmodels/logout/logout",
        nav: true,
        title: "Logout",
      },
      {
        route: "login",
        name: "login",
        moduleId: "viewmodels/login/login",
        nav: true,
        title: "Login",
      },
      {
        route: "signup",
        name: "signup",
        moduleId: "viewmodels/signup/signup",
        nav: true,
        title: "Signup",
      },
      {
        route: "",
        name: "landing",
        moduleId: "viewmodels/landing/landing",
        nav: true,
        title: "Welcome",
      },
      {
        route: "tweets",
        name: "tweets",
        moduleId: "viewmodels/tweets/tweets",
        nav: true,
        title: "Tweets",
      },
      {
        route: "settings",
        name: "settings",
        moduleId: "viewmodels/settings/settings",
        nav: true,
        settings: { auth: true },
        title: "Settings",
      },
      {
        route: "profile/:id",
        href: "profile/:id",
        name: "profile",
        moduleId: "viewmodels/profile/profile",
        nav: true,
        title: "Profile",
      },
      {
        route: "profile/:id/followers",
        href: "profile/:id/followers",
        name: "followers",
        moduleId: "viewmodels/followers/followers",
        nav: true,
        title: "Followers",
      },
      {
        route: "tweet",
        name: "tweet",
        moduleId: "viewmodels/createTweet/createTweet",
        nav: true,
        settings: { auth: true },
        title: "Tweet",
      },
      {
        route: "admin/dashboard",
        name: "adminDashboard",
        moduleId: "viewmodels/adminDashboard/adminDashboard",
        nav: true,
        settings: { auth: true, admin: true},
        title: "Admin Dashboard"
      },
      {
        route: "admin/tweets",
        name: "adminTweets",
        moduleId: "viewmodels/adminTweets/adminTweets",
        nav: true,
        settings: { auth: true, admin: true},
        title: "Administrate Tweets"
      },
      {
        route: "admin/users",
        name: "adminUsers",
        moduleId: "viewmodels/adminUsers/adminUsers",
        nav: true,
        settings: { auth: true, admin: true},
        title: "Administrate Users"
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
  ea: EventAggregator;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  run(navigationInstruction, next) {
    const isLoggedIn = this.service.isAuthenticated();
    const isAdmin = isLoggedIn && this.service.currentUser.isAdmin;

    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) {
      if (!isLoggedIn) {
        this.ea.publish(new FlashMessage("Please log in to view this page."));
        return next.cancel(new Redirect("login"));
      }
    }
    if (navigationInstruction.getAllInstructions().some(i => i.config.settings.admin)) {
      if (!isAdmin) {
        this.ea.publish(new FlashMessage("Insufficient permission to view the page."));
        return next.cancel(new Redirect("tweets"));
      }
    }

    return next();
  }
}

class ClearFlashStep {
  ea: EventAggregator;

  constructor(ea:EventAggregator) {
    this.ea = ea;
  }

  run(navigationInstruction, next) {
    this.ea.publish(new PageChanged());

    return next();
  }
}
