import axios from "axios";

const api = axios.create({
  baseURL: "/auth", // Your base URL for authentication
});

export const googleAuth = async (code) => {
  try {
    const response = await api.get(`/google?code=${code}`);
    return response.data; // Return the response so it can be handled in the component
  } catch (error) {
    throw new Error("Failed to authenticate with Google");
  }
};
