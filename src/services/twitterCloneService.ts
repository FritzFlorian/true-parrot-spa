import User from "./user";
import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus, TweetsChanged} from "./messages";
import AsyncHttpClient from "./asyncHttpClient";
import Tweet from "./tweet";
import {Profile} from "./profile";

@autoinject()
export default class TwitterCloneService {
  currentUser: User;
  ea: EventAggregator;
  httpClient: AsyncHttpClient;

  tweets: Tweet[];
  currentProfileTweets: Tweet[];

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

  /**
   * Logs a user in
   *
   * @param email The email of the user to login
   * @param password The password of the user to login
   */
  login(email:string, password:string) {
    return this.httpClient.authenticate('/api/users/authenticate', { email: email, password: password });
  }

  /**
   * Register a new user. All parameters are required.
   *
   * @param email
   * @param password
   * @param firstName
   * @param lastName
   * @param description
   */
  register(email:string, password:string, firstName:string, lastName:string, description:string) {
    const params = {
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      description: description,
    };

    return this.httpClient.post('/api/users', params).then((result) => {
      this.login(email, password);

      return true;
    }).catch((error) => {
      throw new ServiceError(error);
    });
  }

  /**
   * Logs the local user out.
   */
  logout() {
    this.httpClient.clearAuthentication();

    this.currentUser = null;
    this.ea.publish(new LoginStatus(false, "logout", null));
  }

  /**
   * Reload the global timeline of tweets from the server.
   */
  reloadTweets() {
    this.httpClient.get("/api/tweets").then((response) => {
      if (response.isSuccess) {
        this.tweets = [];
        for (let tweetJson of response.content) {
          const newTweet = Tweet.fromJson(tweetJson);
          newTweet.updateCurrentUser(this.currentUser);

          this.tweets.push(newTweet);
        }

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    });

  }

  /**
   * Deletes the given tweet (user needs permission to do so).
   *
   * @param tweet The tweet to be deleted
   */
  deleteTweet(tweet:Tweet) {
    this.httpClient.delete("/api/tweets/" + tweet.id).then((result) => {
      if (result.isSuccess) {
        this.tweets.forEach((existingTweet, index) => {
          if (existingTweet.id == tweet.id) {
            this.tweets.splice(index, 1);
          }
        });
        this.currentProfileTweets.forEach((existingTweet, index) => {
          if (existingTweet.id == tweet.id) {
            this.currentProfileTweets.splice(index, 1);
          }
        });

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    });
  }

  /**
   * Sets the 'parroting' status of an tweet for the current user.
   *
   * @param tweet The tweet to be parroted/un parroted
   * @param parroting Boolean indicating the desired parroting state
   */
  parrotTweet(tweet:Tweet, parroting:boolean) {
    this.httpClient.patch("/api/tweets/" + tweet.id + "/parrot", { parroting: parroting }).then((result) => {
      if (result.isSuccess) {
        this.tweets.forEach((existingTweet) => {
          if (existingTweet.id == tweet.id) {
            existingTweet.parroting = result.content.parroting;
          }
        });
        tweet.parroting = result.content.parroting;

        this.ea.publish(new TweetsChanged(this.tweets));
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Updates the settings of the current user.
   *
   * @param email The new email address
   * @param firstName The new firstName
   * @param lastName The new lastName
   * @param description The new description
   * @param password optional: The new password, if not provided the password stays unchanged
   */
  updateSettings(email:string, firstName:string, lastName:string, description:string, password:string = "") {
    const settings = {
      email: email,
      firstName: firstName,
      lastName: lastName,
      description: description,
    };

    if (password.length > 0) {
      settings["password"] = password;
    }

    return this.httpClient.patch("/api/users/" + this.currentUser.id, settings).then((result) => {
      if (result.isSuccess) {
        this.currentUser.firstName = result.content.firstName;
        this.currentUser.lastName = result.content.lastName;
        this.currentUser.description = result.content.description;
        this.currentUser.email = result.content.email;
      }

      this.httpClient.setCurrentUser(this.currentUser);
      return this.currentUser;
    }).catch((error) => {
      throw new ServiceError(error);
    });
  }

  /**
   * Queries the server for a users profile with the tweets loaded.
   * Returns the result as a promise.
   *
   * @param userId
   * @returns Promise with the requested profile as a result
   */
  getUserProfile(userId) {
    let profile = new Profile(null, null);
    const userUrl = "/api/users/" + userId;

    return this.httpClient.get(userUrl).then((result) => {
      if (result.isSuccess) {
        profile.user = User.fromJson(result.content);

        return this.httpClient.get(userUrl + "/tweets");
      } else {
        throw 'could not load profile';
      }
    }).then((result) => {
      if (result.isSuccess) {
        profile.tweets = [];

        for (let tweetJson of result.content) {
          const newTweet = Tweet.fromJson(tweetJson);
          newTweet.updateCurrentUser(this.currentUser);
          profile.tweets.push(newTweet);
        }

        this.currentProfileTweets = profile.tweets;

        return profile;
      } else {
        throw 'could not load profile';
      }
    });
  }

  /**
   * Creates a new tweet for the current user.
   *
   * @param message The message to tweet
   * @param image An form image to upload with the tweet
   */
  createTweet(message:string, image = null) {
    const form = new FormData();
    form.append('json', JSON.stringify({ message: message }));
    if (image) {
      form.append('image', image);
    }

    return this.httpClient.post("/api/tweets", form).then((result) => {
       const newTweet = Tweet.fromJson(result.content);

      this.tweets.unshift(newTweet);
      this.ea.publish(new TweetsChanged(this.tweets));

      return newTweet;
    }).catch((error) => {
      throw new ServiceError(error);
    });
  }
}

export class ServiceError extends Error {
  formErrors;
  message:string;

  constructor(error) {
    const response = JSON.parse(error.response);
    super(response.error);

    this.message = response.error || response.message;
    this.formErrors = response.validation_errors || [{ message: this.message }];
  }
}
