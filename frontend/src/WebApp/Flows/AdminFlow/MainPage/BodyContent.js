import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext"; // Correct path
import Message from "./Message";
import AeronauticalJobs from "./AeronauticalJobs";
import SearchBar from "./SearchBar";
import Home from "./Home";
import Filter from "./Filter"; // Import the Filter component
import SavedJobs from "./SavedJobs";
import Applications from "./Applications";
import Support from "./Support";
import Profile from "./Profile"; // Import the Profile component
import YourJobPosts from "./YourJobPosts";
import PostAJob from "./PostAJob";
const BodyContent = () => {
  const { selectedTab, handleSelectTab } = useTabContext();
  console.log("Selected Tab:", selectedTab);

  let content;

  switch (selectedTab) {
    case "home":
      content = <Home />;
      break;
    case "aeronautical-jobs":
      content = <AeronauticalJobs />;
      break;
    case "your-job-posts":
      content = <YourJobPosts />;
      break;
    case "post-a-job":
      content = <PostAJob />;
      break;
    case "searchbar":
      content = <SearchBar />;
      break;
    case "messages":
      content = <Message />; // Assuming Messages is for notifications
      break;
    case "applications":
      content = <Applications />;
      break;
    case "saved-jobs":
      content = <SavedJobs />;
      break;
    case "profile":
      content = <Profile />; // Render the Profile component
      break;
    case "support":
      content = <Support />;
      break;
    case "logout":
      content = <div>Logout Content</div>;
      break;
    case "filter":
      content = <Filter />; // Render the Filter component
      break;
    default:
      content = <div>Select a tab</div>;
  }

  return <div className="flex-1 p-4">{content}</div>;
};

export default BodyContent;
