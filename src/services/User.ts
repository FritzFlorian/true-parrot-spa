import * as gravatar from "gravatar";

export class User {
  firstName: string;
  lastName: string;
  email: string;
  scope: string[];

  constructor(firstName:string, lastName:string, email:string, scope:string[]) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.scope = scope;
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
