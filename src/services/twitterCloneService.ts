import {User} from "./User";
import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus} from "./messages";

@autoinject()
export class TwitterCloneService {
  currentUser: User;
  ea: EventAggregator;

  constructor(ea:EventAggregator) {
    this.currentUser = null;//new User("1234", "Test", "User", "test@test.com", []);
    this.ea = ea;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  login(email:string, password:string) {
    console.log("Try to login " + email + ", " + password);

    this.currentUser = new  User("1234", "Test", "User", email, ["admin"]);
    this.ea.publish(new LoginStatus(this.currentUser, null));
  }
}
