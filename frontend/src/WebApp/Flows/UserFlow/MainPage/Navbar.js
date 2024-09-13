import React from "react";
import { useTabContext } from "./UserHomePageContext/HomePageContext";

const Navbar = () => {
  const { fine } = useTabContext();

  return (
    <div className="bg-white text-gray-800 p-12 border-b border-gray-300 sticky top-0 z-50"></div>
  );
};

export default Navbar;
