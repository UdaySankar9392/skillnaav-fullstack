// utils/paypal.js
const axios = require("axios");

const getAccessToken = async () => {
  const response = await axios({
    method: "post",
    url: `${process.env.PAYPAL_API}/v1/oauth2/token`,
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_CLIENT_SECRET,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: "grant_type=client_credentials",
  });

  return response.data.access_token;
};

module.exports = { getAccessToken };
