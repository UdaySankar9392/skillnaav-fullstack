const cron = require("node-cron");
const User = require("../models/webapp-models/userModel");

cron.schedule("0 0 * * *", async () => {
  try {
    const currentDate = new Date();

    // Find users whose premiumExpiration date has passed
    const expiredUsers = await User.find({
      isPremium: true,
      premiumExpiration: { $lte: currentDate }, // Check if expiration date is less than or equal to current date
    });

    // Update isPremium to false for expired users
    if (expiredUsers.length > 0) {
      const userIds = expiredUsers.map((user) => user._id);
      await User.updateMany(
        { _id: { $in: userIds } },
        { isPremium: false, premiumExpiration: null } // Reset premium status and expiration date
      );

      console.log(`Updated ${expiredUsers.length} users' premium status to false.`);
    } else {
      console.log("No users with expired subscriptions found.");
    }
  } catch (error) {
    console.error("Error updating premium status:", error);
  }
});