import User from "./user";
import {autoinject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {LoginStatus, TweetsChanged, UsersChanged, AdminStatsChanged} from "./messages";
import AsyncHttpClient from "./asyncHttpClient";
import Tweet from "./tweet";

@autoinject()
export default class TwitterCloneService {
  currentUser: User;
  ea: EventAggregator;
  httpClient: AsyncHttpClient;

  tweets: Tweet[];
  users: User[];
  adminStats: any;
  currentProfileTweets: Tweet[];

  constructor(ea:EventAggregator, httpClient:AsyncHttpClient) {
    this.ea = ea;
    this.httpClient = httpClient;

    this.currentUser = this.httpClient.getAuthenticatedUser();
    this.tweets = [];
    this.users = [];
    this.currentProfileTweets = [];
    this.reloadTweets();
    this.reloadUsers();

    ea.subscribe(LoginStatus, (loginStatus:LoginStatus) => {
      this.currentUser = loginStatus.user;
    });

    ea.subscribe(UsersChanged, (message:UsersChanged) => {
      if (this.isAuthenticated() && this.currentUser.isAdmin) {
        this.reloadAdminStats();
      }
    });
    ea.subscribe(TweetsChanged, (message:TweetsChanged) => {
      if (this.isAuthenticated() && this.currentUser.isAdmin) {
        this.reloadAdminStats();
      }
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
   * Reload the global timeline of tweets from the server.
   */
  reloadUsers() {
    this.httpClient.get("/api/users").then((response) => {
      if (response.isSuccess) {
        this.users = [];
        for (let userJson of response.content) {
          const newUser = User.fromJson(userJson);

          this.users.push(newUser);
        }

        this.ea.publish(new UsersChanged(this.users));
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

  deleteTweetsByUser(userId) {
    return this.httpClient.delete("/api/users/" + userId + "/tweets").then((result) => {
      this.tweets = this.tweets.filter(existingTweet => existingTweet.creator.id != userId );
      this.currentProfileTweets =
        this.currentProfileTweets.filter(existingTweet => existingTweet.creator.id != userId );

      this.ea.publish(new TweetsChanged(this.tweets));

      return result.content.message;
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
  getTweetsByUser(userId) {
    const userUrl = "/api/users/" + userId;

    return this.httpClient.get(userUrl + "/tweets").then((result) => {
      const tweets = [];

      for (let tweetJson of result.content) {
        const newTweet = Tweet.fromJson(tweetJson);
        newTweet.updateCurrentUser(this.currentUser);
        tweets.push(newTweet);
      }

      this.currentProfileTweets = tweets;

      return tweets;
    });
  }

  /**
   * Queries the server for a user.
   *
   * @param userId
   * @returns Promise with the requested user.
   */
  getUserProfile(userId) {
    const userUrl = "/api/users/" + userId;

    return this.httpClient.get(userUrl).then((result) => {
      return User.fromJson(result.content);
    });
  }

  deleteUser(userId) {
    const userUrl = "/api/users/" + userId;

    return this.httpClient.delete(userUrl).then((result) => {
      this.users.forEach((existingUser, index) => {
        if (existingUser.id == userId) {
          this.users.splice(index, 1);
        }

        this.ea.publish(new UsersChanged(this.users));

        return this.users;
      });
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

  /**
   * Batch delete tweets using the admin interface
   *
   * @param tweetIds The tweet ids to delete
   */
  adminDeleteTweets(tweetIds:string[]) {
    return this.httpClient.post("/api/admin/tweets/batchDelete", tweetIds).then((result) => {
      this.reloadTweets();

      return result.content.message;
    }).catch((error) => {
      throw new ServiceError(error);
    });
  }

  /**
   * Batch delete users using the admin interface
   *
   * @param userIds The tweet ids to delete
   */
  adminDeleteUsers(userIds:string[]) {
    return this.httpClient.post("/api/admin/users/batchDelete", userIds).then((result) => {
      this.reloadUsers();

      return result.content.message;
    }).catch((error) => {
      throw new ServiceError(error);
    });
  }

  reloadAdminStats() {
    return this.httpClient.get("/api/admin/stats").then((result) => {
      this.adminStats = result.content;
      this.ea.publish(new AdminStatsChanged(this.adminStats));

      return result.content;
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
