import {User} from "./User";

export class TwitterCloneService {
  currentUser: User;

  constructor() {
    this.currentUser = new User("Test", "User", "test@test.com", []);
  }

  isAuthenticated(): boolean {
    return true;
  }
}
