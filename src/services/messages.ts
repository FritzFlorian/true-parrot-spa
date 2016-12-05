import {User} from "./User";

export class LoginStatus {
  user: User;
  error: string;

  constructor(user:User, error:string) {
    this.user = user;
    this.error = error;
  }
}
