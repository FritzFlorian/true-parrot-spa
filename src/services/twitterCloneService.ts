import {User} from "./User";

export class TwitterCloneService {
  currentUser: User;

  constructor() {
    this.currentUser = null;//new User("1234", "Test", "User", "test@test.com", []);
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }
}
