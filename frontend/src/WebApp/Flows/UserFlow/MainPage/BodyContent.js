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
import PremiumPage from "./PremiumPage"; // Import the PremiumPage component

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
    case "searchbar":
      content = <SearchBar />;
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
      content = <Support />;
      break;
    case "logout":
      content = <div>Logout Content</div>;
      break;
    case "filter":
      content = <Filter />;
      break;
    default:
      content = <div>Select a tab</div>;
  }
  switch (selectedTab) {
    case "premium":
      content = <PremiumPage />;
      break;
  }

  return (
    <div className="flex flex-col lg:flex-row p-4 flex-1">
      {/* Desktop View - Flex layout */}
      <div className="lg:flex-1 hidden lg:block">
        {content}
      </div>

      {/* Mobile View - Full screen layout */}
      <div className="lg:hidden flex-1">
        {content}
      </div>
    </div>
  );
};

export default BodyContent;
