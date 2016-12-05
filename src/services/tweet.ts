import User from "./user";

export default class Tweet {
  parroting: string[];
  id: string;
  message: string;
  image: string;
  createdAt: Date;
  creator: User;

  constructor(id:string, message:string, image:string, parroting:string[], createdAt:Date, user:User) {
    this.id = id;
    this.image = image;
    this.message = message;
    this.parroting = parroting;
    this.createdAt = createdAt;
    this.creator = user;
  }

  canUserDeletePost(user:User):boolean {
    if (!user) {
      return false;
    }
    if (user.id == this.creator.id) {
      return true;
    }

    return false;
  }

  hasParrotedTweet(user:User):boolean {
    if (!user) {
      return false;
    }
    for(let parrotingId of this.parroting) {
      if (parrotingId == user.id) {
        return true;
      }
    }

    return false;
  }
}
