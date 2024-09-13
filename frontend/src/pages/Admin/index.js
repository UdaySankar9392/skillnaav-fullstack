import React, { useEffect, useState, lazy, useMemo, Suspense } from "react";
import { useSelector } from "react-redux";
import {
  FaHome,
  FaEye,
  FaCog,
  FaUsers,
  FaDollarSign,
  FaQuestionCircle,
  FaEnvelope,
  FaSpinner,
  FaBars,
} from "react-icons/fa";
import SkillnaavLogo from "../../assets/skillnaav_logo-250w.png";

// Lazy-loaded components
const AdminDiscover = lazy(() => import("./AdminDiscover"));
const AdminVision = lazy(() => import("./AdminVision"));
const AdminFeatures = lazy(() => import("./AdminFeatures"));
const AdminTeam = lazy(() => import("./AdminTeam"));
const AdminPricing = lazy(() => import("./AdminPricing"));
const AdminFaqs = lazy(() => import("./AdminFaqs"));
const AdminContact = lazy(() => import("./AdminContact"));

// Loader component for suspense fallback
const Loader = () => (
  <div className="flex justify-center items-center h-full">
    <FaSpinner className="animate-spin text-4xl text-blue-500" />
  </div>
);

const Admin = () => {
  const { skillnaavData } = useSelector((state) => state.root);
  const [selectedTab, setSelectedTab] = useState("Discover");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = useMemo(
    () => [
      { label: "Discover", component: <AdminDiscover />, icon: <FaHome /> },
      { label: "Vision", component: <AdminVision />, icon: <FaEye /> },
      { label: "Features", component: <AdminFeatures />, icon: <FaCog /> },
      { label: "Team", component: <AdminTeam />, icon: <FaUsers /> },
      { label: "Pricing", component: <AdminPricing />, icon: <FaDollarSign /> },
      { label: "FAQs", component: <AdminFaqs />, icon: <FaQuestionCircle /> },
      { label: "Contact", component: <AdminContact />, icon: <FaEnvelope /> },
    ],
    []
  );

  const handleTabSelect = (label) => {
    setSelectedTab(label);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      window.location.href = "/admin-login";
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-poppins">
      {/* Header */}
      <header className="bg-white shadow-md border-b">
        <div className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center">
            <img
              src={SkillnaavLogo}
              alt="Skillnaav Logo"
              className="w-32 h-auto md:w-40 md:h-auto mr-3"
            />
            <span className="text-gray-800 text-lg md:text-xl font-semibold">
              Admin Panel
            </span>
          </div>
          <span
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/admin-login";
            }}
            className="text-gray-800 text-lg md:text-xl font-semibold cursor-pointer hover:underline"
          >
            Logout
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`bg-gray-800 text-gray-200 ${
            sidebarOpen ? "w-64" : "w-16"
          } transition-all duration-300 py-6 shadow-md`}
        >
          <div className="flex justify-end px-4 mb-6">
            <FaBars
              className="cursor-pointer text-white"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
          <ul>
            {navItems.map((item, index) => (
              <li
                key={index}
                className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-700 transition ${
                  selectedTab === item.label ? "bg-gray-900" : ""
                }`}
                onClick={() => handleTabSelect(item.label)}
              >
                <span className="mr-2 text-lg">{item.icon}</span>
                {sidebarOpen && (
                  <span className="ml-2 text-md font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 bg-white overflow-y-auto shadow-inner">
          <Suspense fallback={<Loader />}>
            {navItems.map((item) =>
              item.label === selectedTab ? (
                <div key={item.label} className="mb-4">
                  {item.component}
                </div>
              ) : null
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default React.memo(Admin);
