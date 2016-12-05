import * as gravatar from "gravatar";

export default class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  scope: string[];
  token: string;

  constructor(id:string, firstName:string, lastName:string, email:string, scope:string[], token:string = "") {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.scope = scope;
    this.token = token;
  }

  fullName():string {
    return this.firstName + " " + this.lastName;
  }

  isAdmin():boolean {
    for (let role of this.scope) {
      if (role == "admin")
        return true;
    }

    return false;
  }

  gravatar():string {
    return gravatar.url(this.email);
  }
}
