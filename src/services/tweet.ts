import User from "./user";

export default class Tweet {
  message: string;
  createdAt: Date;
  user: User;

  constructor(message:string, createdAt:Date, user:User) {
    this.message = message;
    this.createdAt = createdAt;
    this.user = user;
  }
}
