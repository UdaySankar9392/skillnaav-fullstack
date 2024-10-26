// config.js
import { Client, Account } from "appwrite";

// Initialize Appwrite Client
const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1") // Appwrite endpoint
  .setProject("6715ee9b0034e652fb17"); // Replace with your actual project ID

// OAuth Credentials
export const googleOAuth = {
  appId:
    "805153616143-nrsjta36jv8i0skke363gustddqpctjn.apps.googleusercontent.com",
  appSecret:
    "805153616143-nrsjta36jv8i0skke363gustddqpctjn.apps.googleusercontent.com",
  redirectUri:
    "https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/6715ee9b0034e652fb17",
};

export const account = new Account(client);
export default client;