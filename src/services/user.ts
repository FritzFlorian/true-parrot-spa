import * as gravatar from "gravatar";
import * as moment from "moment";

export default class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  scope: string[];
  token: string;
  description: string;
  followers: any[];
  following: any[];

  constructor(id:string, firstName:string, lastName:string, email:string, createdAt:Date, description:string = "",
                  scope:string[] = [], following:any[] = [], followers:any[] = [], token:string = "") {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.scope = scope;
    this.token = token;
    this.description = description;
    this.createdAt = createdAt;
    this.followers = followers;
    this.following = following;
  }

  static fromJson(json) {
    console.log(json);
    return new User(json._id || json.id, json.firstName, json.lastName, json.email, json.createdAt,
                      json.description, json.scope, json.following, json.followers, json.token);
  }

  get fullName():string {
    return this.firstName + " " + this.lastName;
  }

  get isAdmin():boolean {
    for (let role of this.scope) {
      if (role == "admin")
        return true;
    }

    return false;
  }

  canDeleteTweets(other:User) {
    return this.id == other.id || this.isAdmin;
  }

  get gravatar():string {
    return gravatar.url(this.email);
  }

  get bigGravatar():string {
    return gravatar.url(this.email, { s: '300' });
  }

  get timeAgo():string {
    return moment(this.createdAt).fromNow();
  }
}
