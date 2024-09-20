import React, { useState } from "react";
import SkillNaavLogo from "../assets/skillnaav_logo-250w.png";
import Menu from "../assets/Menu.svg";
import Close from "../assets/close.png";

const navLinks = [
  { name: "Discover", href: "#discover" },
  { name: "Vision", href: "#vision" },
  { name: "Features", href: "#features" },
  { name: "Team", href: "#team" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQs", href: "#faqs" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white z-50">
      <div className="flex items-center justify-between px-5 py-4 lg:container lg:mx-auto lg:px-20">
        <div className="flex items-center gap-x-5">
          <a href="/" aria-label="Home">
            <img
              className="w-[150px]"
              src={SkillNaavLogo}
              alt="SkillNaav Logo"
            />
          </a>
          <div className="hidden lg:flex gap-x-8 ml-8">
            {navLinks.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="text-[#36485C] font-medium hover:text-[#451E5D] transition duration-300"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-x-5">
          <a
            href="#contacts"
            className="hidden lg:block font-medium text-white bg-[#451E5D] hover:bg-[#2c3b4e] px-4 py-2 rounded-md transition duration-300"
          >
            Request Call Back
          </a>
          <div className="lg:hidden" onClick={toggleMenu}>
            <img
              src={menuOpen ? Close : Menu}
              alt="Menu Button"
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          } fixed top-0 left-0 w-full h-screen bg-white flex flex-col items-center justify-center gap-5 z-50 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-end w-full p-4">
            <img
              src={Close}
              alt="Close Menu"
              onClick={toggleMenu}
              width={30}
              height={30}
              className="cursor-pointer transition-transform duration-300 transform hover:scale-110"
            />
          </div>
          {navLinks.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={toggleMenu}
              className="text-[#36485C] font-medium text-2xl transition duration-300 transform hover:scale-105"
            >
              {item.name}
            </a>
          ))}
          <a href="#contacts" onClick={toggleMenu}>
            <div className="font-medium text-white bg-[#451E5D] hover:bg-[#2c3b4e] px-6 py-3 rounded-md transition duration-300 text-2xl">
              Request A Call Back
            </div>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
