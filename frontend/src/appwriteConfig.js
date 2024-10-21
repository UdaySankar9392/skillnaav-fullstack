// appwriteConfig.js
import { Client, Account } from "appwrite";

const client = new Client();

client
  .setEndpoint("https://cloud.appwrite.io/v1") // Your Appwrite Endpoint
  .setProject("6715ee9b0034e652fb17"); // Your project ID

const account = new Account(client);

export { client, account };
