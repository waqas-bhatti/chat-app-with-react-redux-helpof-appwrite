import {
  Client,
  Account,
  ID,
  Databases,
  Teams,
  OAuthProvider,
  Query,
} from "appwrite";
import config from "../Config/config";

export class AuthService {
  client = new Client();
  account;

  constructor() {
    this.client
      .setEndpoint(config.appwriteUrl)
      .setProject(config.appwriteProjectID);
    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
  }

  isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  async createAccount(email, password, fullName) {
    if (!this.isValidEmail(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    try {
      const userId = ID.unique(); // Generate unique user ID
      const userAccount = await this.account.create(
        userId,
        email,
        password,
        fullName
      );
      return userAccount;
    } catch (error) {
      throw new Error(error.message || "Account creation failed.");
    }
  }

  async login(email, password) {
    if (!this.isValidEmail(email)) {
      throw new Error("Invalid email format");
    }
    try {
      const session = await this.account.createEmailPasswordSession(
        email,
        password
      );
      return session;
    } catch (error) {
      throw new Error(error.message || "Login failed.");
    }
  }

  async googleAuth() {
    try {
      this.account.createOAuth2Session(
        OAuthProvider.Google,
        "http://chatapp-mu-weld.vercel.app/chatroom"
      );
    } catch (error) {
      throw new Error("Failed to login with Google", error);
    }
  }

  async getCurrentUser() {
    try {
      const user = await this.account.get();
      return user;
    } catch (error) {
      throw new Error(`Failed to get user ${error}`);
    }
  }

  async logout() {
    try {
      const user = await this.getCurrentUser();
      if (user) {
        return await this.account.deleteSessions();
      }
    } catch (error) {
      console.error(`Failed to logout: ${error.message}`);
    }
  }
}

const authervice = new AuthService();
export default authervice;
