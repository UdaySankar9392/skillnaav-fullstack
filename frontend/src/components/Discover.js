import React from "react";
import { motion } from "framer-motion";
import { Carousel } from "antd";
import Gradient from "../assets/Gradient.svg";
import HeroImage from "../assets/app_mockup.png";
import BlueArrow from "../assets/blue-button.svg";
import Google from "../assets/Google.svg";
import Slack from "../assets/Slack.svg";
import Trustpilot from "../assets/Trustpilot.svg";
import Cnn from "../assets/CNN.svg";
import Clutch from "../assets/Clutch.svg";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const { skillnaavData } = useSelector((state) => state.root);
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/user");
  };
  if (
    !skillnaavData ||
    !skillnaavData.discover ||
    skillnaavData.discover.length === 0
  ) {
    return null;
  }

  const discover = skillnaavData.discover[0];
  const discovercompimg = skillnaavData.discovercompimg || [];
  const {
    discoverheading,
    discoversubheading,
    tryforfreebtn,
    viewpricebtn,
    imgUrl,
  } = discover;

  const renderCompanyImages = () => {
    const companies = discovercompimg.length
      ? discovercompimg.slice(0, 5)
      : [
          { src: Google, alt: "Google" },
          { src: Slack, alt: "Slack" },
          { src: Trustpilot, alt: "Trustpilot" },
          { src: Cnn, alt: "CNN" },
          { src: Clutch, alt: "Clutch" },
        ];

    return (
      <Carousel autoplay dots={false}>
        {companies.map((company, index) => (
          <div key={index}>
            <img
              src={company.imageUrl || company.src}
              alt={company.alt || `company ${index + 1}`}
              className="w-24 h-24 object-contain mx-auto"
            />
          </div>
        ))}
      </Carousel>
    );
  };

  return (
    <motion.div
      id="discover"
      className="pt-20 lg:pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="px-6 sm:px-10 lg:px-20 xl:px-32 text-center">
        <motion.h1
          className="text-3xl sm:text-4xl font-medium text-gray-900 lg:text-5xl xl:text-6xl lg:leading-snug"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {discoverheading}
        </motion.h1>
        <motion.p
          className="pt-4 sm:pt-6 text-base sm:text-lg text-gray-700 lg:text-lg xl:text-xl lg:leading-7"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {discoversubheading}
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-6 sm:pt-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            className="bg-blue-600 text-white w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-4 rounded-md hover:bg-blue-700 transition duration-200 cursor-pointer"
            onClick={handleButtonClick}
          >
            {tryforfreebtn}
          </button>
          <button className="text-blue-600 font-medium flex items-center justify-center gap-2 w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-4 rounded-md border border-blue-600 hover:bg-blue-100 transition duration-200">
            <a href="#pricing">{viewpricebtn}</a>
            <span>
              <img src={BlueArrow} alt="Learn More" />
            </span>
          </button>
        </motion.div>
      </div>
      <motion.div
        className="relative flex flex-col items-center w-full mt-6 sm:mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      >
        <div className="w-full relative">
          <img
            src={Gradient}
            alt="Gradient"
            className="w-full object-cover min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] xl:min-h-[700px]"
          />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <img
              src={imgUrl || HeroImage}
              alt="Hero"
              className="max-h-[200px] sm:max-h-[300px] lg:max-h-[400px] xl:max-h-[500px] object-contain"
            />
          </div>
        </div>
        <div className="absolute bottom-0 w-full flex flex-col items-center mt-6 lg:mt-10 xl:mt-12">
          <div className="w-full px-4 sm:px-0 lg:px-20 xl:px-32">
            <div className="text-white text-center">
              <p className="text-base mt-4 sm:text-lg lg:text-lg xl:text-xl mb-2 hidden sm:block">
                Navigate to the Best Companies
              </p>
            </div>
            {renderCompanyImages()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Discover;
