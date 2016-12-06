import * as gravatar from "gravatar";

export default class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  scope: string[];
  token: string;
  description: string;

  constructor(id:string, firstName:string, lastName:string, email:string, createdAt:Date,
                description:string = "", scope:string[] = [], token:string = "") {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.scope = scope;
    this.token = token;
    this.description = description;
    this.createdAt = createdAt;
  }

  static fromJson(json) {
    return new User(json._id || json.id, json.firstName, json.lastName, json.email,
                    json.createdAt, json.description, json.scope, json.token);
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

  get gravatar():string {
    return gravatar.url(this.email);
  }

  get bigGravatar():string {
    return gravatar.url(this.email, { s: '300' });
  }
}
