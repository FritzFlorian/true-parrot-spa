import {autoinject} from "aurelia-framework";
import TwitterCloneService from "../../services/twitterCloneService";
import {FlashMessage} from "../../services/messages";
import {EventAggregator} from "aurelia-event-aggregator";

@autoinject()
export class Logout {
  service: TwitterCloneService;
  ea: EventAggregator;

  constructor(service:TwitterCloneService, ea:EventAggregator) {
    this.service = service;
    this.ea = ea;
  }

  logout() {
    this.ea.publish(new FlashMessage("Logged Out"));
    this.service.logout();
  }

  attached() {
    runJquery();
  }
}
