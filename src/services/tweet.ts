import User from "./user";

export default class Tweet {
  parroting: string[];
  id: string;
  message: string;
  image: string;
  createdAt: Date;
  creator: User;

  // Needed to compute virtual properties
  currentUser: User;

  constructor(id:string, message:string, image:string, parroting:string[], createdAt:Date, creator:User) {
    this.id = id;
    this.image = image;
    this.message = message;
    this.parroting = parroting;
    this.createdAt = createdAt;
    this.creator = creator;
  }

  static fromJson(json) {
    return new Tweet(json._id, json.message, json.image, json.parroting, json.createdAt, User.fromJson(json.creator));
  }

  updateCurrentUser(currentUser: User) {
    this.currentUser = currentUser;
  }

  get canUserDeletePost():boolean {
    if (!this.currentUser) {
      return false;
    }
    if (this.currentUser.id == this.creator.id || this.currentUser.isAdmin) {
      return true;
    }

    return false;
  }

  get hasParrotedTweet():boolean {
    if (!this.currentUser) {
      return false;
    }
    for(let parrotingId of this.parroting) {
      if (parrotingId == this.currentUser.id) {
        return true;
      }
    }

    return false;
  }
}
