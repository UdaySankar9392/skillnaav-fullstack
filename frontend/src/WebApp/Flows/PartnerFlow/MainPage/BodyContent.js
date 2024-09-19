import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext";
import Message from "./Message";
import AeronauticalJobs from "./AeronauticalJobs";
import SearchBar from "./SearchBar";
import Home from "./Home";
import Filter from "./Filter";
import SavedJobs from "./SavedJobs";
import Applications from "./Applications";
import Profile from "./Profile";
import Support from "./Support";
import YourJobPosts from "./YourJobPosts";
import PostAJob from "./PostAJob";

const BodyContent = () => {
  const { selectedTab } = useTabContext();

  let content;

  switch (selectedTab) {
    case "your-job-posts":
      content = <YourJobPosts />;
      break;
    case "post-a-job":
      content = <PostAJob />;
      break;
    case "messages":
      content = <Message />;
      break;
    case "applications":
      content = <Applications />;
      break;
    case "saved-jobs":
      content = <SavedJobs />;
      break;
    case "profile":
      content = <Profile />;
      break;
    case "support":
      content = <Support />; // Render the Support component
      break;
    case "logout":
      content = <div>You have been logged out. Please log in again.</div>; // Logout message or component
      break;
    default:
      content = <div>Select a tab</div>;
  }

  return <div className="flex-1 p-4">{content}</div>;
};

export default BodyContent;
