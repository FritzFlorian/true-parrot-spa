import {autoinject} from "aurelia-framework";
import {HttpClient} from "aurelia-http-client";
import Fixtures from "./fixtures";
import {EventAggregator} from 'aurelia-event-aggregator';
import {LoginStatus} from './messages';
import User from "./user";

@autoinject()
export default class AsyncHttpClient {
  httpClient: HttpClient;
  ea: EventAggregator;

  constructor(httpClient:HttpClient, ea:EventAggregator, fixtures:Fixtures) {
    this.httpClient = httpClient;
    this.httpClient.configure( configuration => {
      configuration.withBaseUrl(fixtures.baseUrl);
    });
    this.ea = ea;
  }

  getAuthenticatedUser():User {
    let user:User;
    const localAuth = localStorage["trueParrot"];

    if (localAuth && localAuth !== 'null') {
      const userJson = JSON.parse(localAuth);
      user = new User(userJson.id, userJson.firstName, userJson.lastName,
                        userJson.email, userJson.scope, userJson.token);

      this.httpClient.configure(http => {
        http.withHeader('Authorization', 'bearer ' + user.token);
      });
    }

    return user;
  }

  authenticate(url:string, user) {
    this.httpClient.post(url, user).then(response => {
      const status = response.content;

      if (status.success) {
        const user = new User(status.user._id, status.user.firstName, status.user.lastName,
                                status.user.email, status.user.scope, status.token);

        localStorage["trueParrot"] = JSON.stringify(user);
        this.httpClient.configure(configuration => {
          configuration.withHeader("Authorization", "bearer " + status.token);
        });

        this.ea.publish(new LoginStatus(true, null, user));
      } else {
        this.ea.publish(new LoginStatus(false, status.message, null));
      }
    }).catch((error) => {
      this.ea.publish(new LoginStatus(false, "service not available", null));
    });
  }

  clearAuthentication() {
    localStorage["trueParrot"] = null;
    this.httpClient.configure(configuration => {
      configuration.withHeader("Authorization", "");
    });
  }

  get(url:string) {
    return this.httpClient.get(url);
  }

  post(url:string, obj) {
    return this.httpClient.post(url, obj);
  }

  delete(url:string) {
    return this.httpClient.delete(url);
  }
}
