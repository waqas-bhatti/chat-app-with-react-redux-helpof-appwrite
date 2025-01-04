import { Client, Databases, ID, Query, Storage } from "appwrite";
import config from "../Config/config";
import authervice from "./auth";

export class AppwriteService {
  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(config.appwriteUrl)
      .setProject(config.appwriteProjectID);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  // 🔹 Create a New Message
  async createMessage(userId, recipientId, messagechat, featuredImage = null) {
    try {
      const documentId = ID.unique();
      const response = await this.databases.createDocument(
        config.appwriteDatabaseId,
        config.appwriteColletionId,
        documentId,
        {
          userId,
          recipientId,
          messagechat,
          featuredImage,
          timestamp: new Date().toISOString(),
        }
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  async deleteMessage(documentId) {
    try {
      const response = await this.databases.deleteDocument(
        config.appwriteDatabaseId,
        config.appwriteColletionId,
        documentId
      );
      return response;
    } catch (error) {
      throw new Error("Failed to delete the message", error);
    }
  }

  async updateMessage(documentId, updatedMessage) {
    try {
      const response = await this.databases.updateDocument(
        config.appwriteDatabaseId,
        config.appwriteColletionId,
        documentId,
        {
          messagechat: updatedMessage,
        }
      );
      return response;
    } catch (error) {
      throw new Error(`Failed to update the message: ${error.message}`);
    }
  }

  // 🔹 Get Messages Between Two Users
  // 🔹 Get Messages Between Two Users
  async getMessages(userId, recipientId) {
    try {
      // Ensure both userId and recipientId are valid
      if (!userId || !recipientId) {
        throw new Error("Both userId and recipientId must be provided.");
      }

      const response = await this.databases.listDocuments(
        config.appwriteDatabaseId,
        config.appwriteColletionId,
        [
          Query.or([
            Query.and([
              Query.equal("userId", userId),
              Query.equal("recipientId", recipientId),
            ]),
            Query.and([
              Query.equal("userId", recipientId),
              Query.equal("recipientId", userId),
            ]),
          ]),
          Query.orderAsc("timestamp"), // Order messages by timestamp
        ]
      );

      return response.documents;
    } catch (error) {
      console.error("Failed to fetch messages:", error.message);
      return []; // Return an empty array if an error occurs
    }
  }

  // 🔹 Add a New User to Database
  async addUser(userName) {
    try {
      // Get the current authenticated user
      const user = await authervice.getCurrentUser();
      const userId = user.$id; // Authenticated user ID

      // Check if user already exists in the database
      const existingUsers = await this.fetchAllUser();
      const userExists = existingUsers.find((u) => u.userId === userId);

      if (userExists) {
        console.log("User already exists!");
        return userExists; // Return the existing user
      }

      // Add the user if it doesn't exist
      const response = await this.databases.createDocument(
        config.appwriteDatabaseId,
        config.appwriteUserCollectionId,
        userId, // Use the same user ID
        {
          userId,
          userName,
        }
      );
      return response; // Return newly added user
    } catch (error) {
      throw new Error(`Failed to add user: ${error.message}`);
    }
  }

  // 🔹 Fetch All Users
  async fetchAllUser() {
    try {
      const response = await this.databases.listDocuments(
        config.appwriteDatabaseId,
        config.appwriteUserCollectionId
      );
      return response.documents; // Return user list
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
      return [];
    }
  }

  async uploadImge(file) {
    try {
      const response = await this.bucket.createFile(
        config.appwriteBucketId,
        ID.unique(),
        file
      );
      return response.$id;
    } catch (error) {
      throw new Error("Failed to create a file");
    }
  }

  async getFilePreview(fileId) {
    try {
      return this.bucket.getFilePreview(config.appwriteBucketId, fileId);
    } catch (error) {
      console.error("Failed to fetch file preview:", error.message);
      throw new Error("Failed to fetch file preview.");
    }
  }

  async subscribeToMessage(userId, recipientId, callback) {
    try {
      const subscription = this.databases.subscribe(
        config.appwriteDatabaseId,
        config.appwriteColletionId,
        (payload) => {
          const { userId: senderId, recipientId: receiverId } =
            payload.events[0].data;
          if (
            (senderId === userId && receiverId === recipientId) ||
            (senderId === recipientId && receiverId === userId)
          ) {
            callback(payload.events[0].data);
          }
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe(); // Ensure proper cleanup
        }
      };
    } catch (error) {
      console.error("Failed to subscribe:", error);
      return () => {}; // Return a no-op unsubscribe function in case of failure
    }
  }
}

const appwriteService = new AppwriteService();
export default appwriteService;
