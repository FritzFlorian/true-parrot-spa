import User from "./user";

export class LoginStatus {
  success: boolean;
  error: string;
  user: User;

  constructor(success: boolean, error:string, user: User) {
    this.success = success;
    this.error = error;
    this.user = user;
  }
}
