import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import Home from "./pages/Home";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { HideLoading, SetSkillNaavData } from "./redux/rootSlice";
import Admin from "./pages/Admin";
import Login from "./pages/Admin/Login";
import UserCreateAccount from "./WebApp/Flows/UserFlow/SignUpLogin/UserCreateAccount";
import UserLogin from "./WebApp/Flows/UserFlow/SignUpLogin/UserLogin";
import UserFlow from "./WebApp/Flows/UserFlow/UserFlow";
import UserMainPage from "./WebApp/Flows/UserFlow/MainPage/UserMainPage";
import UserProfileForm from "./WebApp/Flows/UserFlow/SignUpLogin/UserProfileBuilding/UserProfileForm";
import UserProfilePicture from "./WebApp/Flows/UserFlow/SignUpLogin/UserProfileBuilding/UserProfilePicture";
import UserforgotPassword from "./WebApp/Flows/UserFlow/SignUpLogin/UserforgotPassword";
import PartnerFlow from "./WebApp/Flows/PartnerFlow/PartnerFlow";
import PartnerCreateAccount from "./WebApp/Flows/PartnerFlow/SignUpLogin/PartnerCreateAccount";
import PartnerLogin from "./WebApp/Flows/PartnerFlow/SignUpLogin/PartnerLogin";
import PartnerProfileForm from "./WebApp/Flows/PartnerFlow/SignUpLogin/UserProfileBuilding/PartnerProfileForm";
import PartnerProfilePicture from "./WebApp/Flows/PartnerFlow/SignUpLogin/UserProfileBuilding/PartnerProfilePicture";
import PartnerMainPage from "./WebApp/Flows/PartnerFlow/MainPage/PartnerMainPage";
import PartnerforgotPassword from "./WebApp/Flows/PartnerFlow/SignUpLogin/PartnerforgotPassword";
import AdminCreateAccount from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminCreateAccount";
import AdminLogin from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminLogin";
import AdminProfileForm from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminProfileBuilding/AdminProfileForm";
import AdminProfilePicture from "./WebApp/Flows/AdminFlow/SignUpLogin/AdminProfileBuilding/AdminProfilePicture";
import AdminMainPage from "./WebApp/Flows/AdminFlow/MainPage/AdminMainPage";
import TryforFree from "./WebApp/TryforFree";

// Add the new route component
const RegistrationComplete = () => {
  return <div>Registration Complete! Redirecting you to your dashboard...</div>;
};

function App() {
  const { skillnaavData, reloadData } = useSelector((state) => state.root);
  const dispatch = useDispatch();

  const getSkillNaavData = async () => {
    try {
      const response = await axios.get("/api/skillnaav/get-skillnaav-data");
      dispatch(SetSkillNaavData(response.data));
      dispatch(HideLoading());
    } catch (error) {
      console.error("Error fetching SkillNaav data:", error);
      dispatch(HideLoading());
    }
  };

  useEffect(() => {
    if (!skillnaavData || reloadData) {
      getSkillNaavData();
    }
  }, [skillnaavData, reloadData]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Skillnaav Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        {/* Skillnaav Web App Routes */}
        {/* User Flow */}
        <Route path="/user" element={<UserFlow />} />
        <Route path="/user-create-account" element={<UserCreateAccount />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user-profile-form" element={<UserProfileForm />} />
        <Route path="/user-profile-picture" element={<UserProfilePicture />} />
        <Route path="/user-main-page" element={<UserMainPage />} />
        <Route path="/user-forgot-password" element={<UserforgotPassword />} />

        {/* Partner Flow */}
        <Route path="/partner" element={<PartnerFlow />} />
        <Route path="/partner-create-account" element={<PartnerCreateAccount />} />
        <Route path="/partner/login" element={<PartnerLogin />} />
        <Route path="/partner-profile-form" element={<PartnerProfileForm />} />
        <Route path="/partner-profile-picture" element={<PartnerProfilePicture />} />
        <Route path="/partner-main-page" element={<PartnerMainPage />} />
        <Route path="/partner-forgot-password" element={<PartnerforgotPassword />} />

        {/* Admin Flow */}
        <Route path="/admin-create-account" element={<AdminCreateAccount />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin-profile-form" element={<AdminProfileForm />} />
        <Route path="/admin-profile-picture" element={<AdminProfilePicture />} />
        <Route path="/admin-main-page" element={<AdminMainPage />} />

        {/* Try for free */}
        <Route path="/choose-role" element={<TryforFree />} />

        {/* Additional Route for Registration Complete */}
        <Route path="/registration-complete" element={<RegistrationComplete />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
