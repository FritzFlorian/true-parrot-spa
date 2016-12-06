import User from "./user";
import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus, TweetsChanged} from "./messages";
import AsyncHttpClient from "./asyncHttpClient";
import Tweet from "./tweet";

@autoinject()
export default class TwitterCloneService {
  currentUser: User;
  ea: EventAggregator;
  httpClient: AsyncHttpClient;

  tweets: Tweet[];

  constructor(ea:EventAggregator, httpClient:AsyncHttpClient) {
    this.ea = ea;
    this.httpClient = httpClient;

    this.currentUser = this.httpClient.getAuthenticatedUser();
    this.tweets = [];
    this.reloadTweets();

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

  register(email:string, password:string, firstName:string, lastName:string, description:string) {
    const params = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      description: description,
    };

    this.httpClient.post('/api/users', params).then((result) => {
      if (result.isSuccess) {
        this.login(email, password);
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  logout() {
    this.httpClient.clearAuthentication();

    this.currentUser = null;
    this.ea.publish(new LoginStatus(false, "logout", null));
  }

  reloadTweets() {
    this.httpClient.get("/api/tweets").then((response) => {
      if (response.isSuccess) {
        this.tweets = [];
        for (let tweetJson of response.content) {
          const tweetUser = new User(tweetJson.creator._id, tweetJson.creator.firstName, tweetJson.creator.lastName,
                                        tweetJson.creator.email);

          const newTweet = new Tweet(tweetJson._id, tweetJson.message, tweetJson.image, tweetJson.parroting,
                                        new Date(tweetJson.createdAt), tweetUser);
          newTweet.updateCurrentUser(this.currentUser);

          this.tweets.push(newTweet);
        }

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    });

  }

  deleteTweet(tweet:Tweet) {
    this.httpClient.delete("/api/tweets/" + tweet.id).then((result) => {
      if (result.isSuccess) {
        this.tweets.forEach((existingTweet, index) => {
          if (existingTweet.id == tweet.id) {
            this.tweets.splice(index, 1);
          }
        });

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    });
  }

  parrotTweet(tweet:Tweet, parroting:boolean) {
    this.httpClient.patch("/api/tweets/" + tweet.id + "/parrot", { parroting: parroting }).then((result) => {
      if (result.isSuccess) {
        this.tweets.forEach((existingTweet) => {
          if (existingTweet.id == tweet.id) {
            existingTweet.parroting = result.content.parroting;
          }
        });

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    }).catch((error) => {
      console.log(error);
    });
  }

}
