import User from "./user";
import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus} from "./messages";
import AsyncHttpClient from "./asyncHttpClient";

@autoinject()
export default class TwitterCloneService {
  currentUser: User;
  ea: EventAggregator;
  httpClient: AsyncHttpClient;

  constructor(ea:EventAggregator, httpClient:AsyncHttpClient) {
    this.ea = ea;
    this.httpClient = httpClient;

    this.currentUser = httpClient.getAuthenticatedUser();

    ea.subscribe(LoginStatus, (loginStatus:LoginStatus) => {
      this.currentUser = loginStatus.user;
    });
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  login(email:string, password:string) {
    this.httpClient.authenticate('/api/users/authenticate', { email: email, password: password });
  }

  logout() {
    this.httpClient.clearAuthentication();

    this.currentUser = null;
    this.ea.publish(new LoginStatus(false, "logout", null));
  }
}
