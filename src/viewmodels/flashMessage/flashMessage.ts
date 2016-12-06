import {autoinject} from "aurelia-framework";
import {Router} from "aurelia-router";
import {EventAggregator} from "aurelia-event-aggregator";
import {FlashMessage, PageChanged} from "../../services/messages";

@autoinject()
export class HeaderMessage {
  router: Router;
  messages: FlashMessage[];

  constructor(router:Router, ea:EventAggregator) {
    this.router = router;
    this.messages = [];

    ea.subscribe(FlashMessage, (message:FlashMessage) => {
      this.messages.unshift(message);
    });

    // Display current messages, delete old ones
    ea.subscribe(PageChanged, (unused:PageChanged) => {
      this.messages.forEach((message) => {
        message.displayIn--;
      });

      this.messages = this.messages.filter((message) => {
        return message.displayIn >= 0;
      });
    });
  }

}
