import React, { useState } from "react";
import Check from "../../../../assets/check.svg";
import { useSelector } from "react-redux";
import axios from "axios";

function Pricing() {
  const { skillnaavData } = useSelector((state) => state.root);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" }); // State for alert
  const [isPremium, setIsPremium] = useState(
    JSON.parse(localStorage.getItem("userInfo"))?.isPremium || false
  ); // Local state for isPremium

  if (!skillnaavData) {
    return <div>Loading...</div>; // Loading state
import React from "react";
import Check from "../../../../assets/check.svg";
import { useSelector } from "react-redux";

function Pricing() {
  const { skillnaavData } = useSelector((state) => state.root);

  if (!skillnaavData) {
    return <div>Loading...</div>; // Add loading state if skillnaavData is null

  const { pricing, pricingcard } = skillnaavData;

  if (!pricing || pricing.length === 0 || !pricingcard || pricingcard.length === 0) {
    !pricing ||
    pricing.length === 0 ||
    !pricingcard ||
    pricingcard.length === 0
  ) {

  const { priceheading } = pricing[0];

  const colorClasses = {
    teal: { bg: "bg-teal-100", text: "text-teal-700", subtext: "text-teal-900", hoverBg: "hover:bg-teal-200" },
    purple: { bg: "bg-purple-100", text: "text-purple-700", subtext: "text-purple-900", hoverBg: "hover:bg-purple-200" },
    orange: { bg: "bg-orange-100", text: "text-orange-700", subtext: "text-orange-900", hoverBg: "hover:bg-orange-200" },
    teal: {
      bg: "bg-teal-100",
      text: "text-teal-700",
      subtext: "text-teal-900",
      hoverBg: "hover:bg-teal-200",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      subtext: "text-purple-900",
      hoverBg: "hover:bg-purple-200",
    },
    orange: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      subtext: "text-orange-900",
      hoverBg: "hover:bg-orange-200",
    },

  };

  const getColorClass = (index) => {
    const colors = Object.values(colorClasses);

    return colors[index % colors.length];
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000); // Hide alert after 5 seconds
  };

  const handlePayment = async (amountString, planType, duration) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    try {
      // Handle Free Trial plan
      if (planType === "Free Trial") {
        window.location.hash = "#discover"; // Redirect to #discover section
        return;
      }

      const amount = parseFloat(amountString.replace(/[^0-9.]/g, ""));
      const amountInPaise = Math.round(amount * 100);

      const orderResponse = await axios.post("/api/payments/order", {
        amount: amountInPaise,
        currency: "INR",
        planType,
        duration,
        userId: userInfo._id,
        email: userInfo.email,
      });

      const orderData = orderResponse.data;

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Skillnaav",
        description: `Payment for ${planType} plan`,
        order_id: orderData.order_id,
        handler: async function (response) {
          const verifyResponse = await axios.post("/api/payments/verify", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            userId: userInfo._id,
            planType,
            amount: amountInPaise,
            email: userInfo.email,
            duration,
          });

          if (verifyResponse.data.success) {
            showAlert("Payment verified successfully!", "success");
            // Update user info in localStorage and state
            userInfo.isPremium = true;
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            setIsPremium(true); // Update local state
          } else {
            showAlert("Payment verification failed.", "error");
          }
        },
        prefill: {
          name: userInfo.name || "User",
          email: userInfo.email || "user@example.com",
          contact: userInfo.phone || "N/A",
        },
        theme: { color: "#3399cc" },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      showAlert("Payment processing failed. Please try again.", "error");
    }
  };

  const Alert = ({ message, type }) => {
    const alertClasses = {
      success: "bg-green-100 border-green-400 text-green-700",
      error: "bg-red-100 border-red-400 text-red-700",
    };

    return (
      <div
        className={`fixed top-4 right-4 border-l-4 p-4 ${alertClasses[type]} rounded-lg shadow-lg z-50`}
        role="alert"
      >
        <p className="font-medium">{message}</p>
      </div>
    );
  };

  return (
    <div id="pricing" className="py-12 my-12 pb-12 lg:py-16 relative">
      {alert.show && <Alert message={alert.message} type={alert.type} />}
      <h1 className="text-center font-medium text-2xl lg:text-4xl text-gray-900 mb-6">{priceheading}</h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        {pricingcard.map((card, index) => {
          const colorClass = getColorClass(index);

          return (
            <div key={index} className={`w-full ${colorClass.bg} p-6 flex flex-col justify-between shadow-lg rounded-lg`} style={{ marginTop: "20px" }}>
              <div>
                <h3 className={`font-medium ${colorClass.text} text-xl lg:text-2xl`}>{card.plantype}</h3>
                <p className={`pt-3 ${colorClass.subtext} lg:text-lg`}>{card.plantypesubhead}</p>
                <h2 className={`pt-4 text-2xl font-medium ${colorClass.text} lg:text-3xl`}>
                  {card.plantype === "Institutional (B2B)" ? <span className="text-orange-700">Contact Us</span> : card.price}
                </h2>
                <p className={`pt-2 ${colorClass.subtext} lg:text-lg`}>Duration: {card.duration} month</p>
                <ul className={`flex flex-col gap-2 pt-4 ${colorClass.subtext}`}>
                  <li className="flex items-center gap-2"><img src={Check} alt="included" width={16} height={16} />{card.pricepoint1}</li>
                  <li className="flex items-center gap-2"><img src={Check} alt="included" width={16} height={16} />{card.pricepoint2}</li>
                  <li className="flex items-center gap-2"><img src={Check} alt="included" width={16} height={16} />{card.pricepoint3}</li>

    const colorIndex = index % colors.length; // Calculate color index based on card index
    return colors[colorIndex];
  };

  return (
    <div id="pricing" className="py-12 my-12 pb-12 lg:py-16">
      <h1 className="text-center font-medium text-2xl lg:text-4xl text-gray-900 mb-6">
        {priceheading}
      </h1>
      <div className="flex flex-col gap-6 lg:flex-row">
        {pricingcard.map((card, index) => {
          const colorClass = getColorClass(index); // Pass index to getColorClass

          return (
            <div
              key={index}
              className={`w-full ${colorClass.bg} p-6 flex flex-col justify-between shadow-lg rounded-lg`}
              style={{ marginTop: "20px" }} // Added margin top here
            >
              <div>
                <h3
                  className={`font-medium ${colorClass.text} text-xl lg:text-2xl`}
                >
                  {card.plantype}
                </h3>
                <p className={`pt-3 ${colorClass.subtext} lg:text-lg`}>
                  {card.plantypesubhead}
                </p>
                <h2
                  className={`pt-4 text-2xl font-medium ${colorClass.text} lg:text-3xl`}
                >
                  {card.plantype === "Institutional (B2B)" ? (
                    <span className="text-orange-700">Contact Us</span>
                  ) : (
                    card.price
                  )}
                </h2>
                <ul
                  className={`flex flex-col gap-2 pt-4 ${colorClass.subtext}`}
                >
                  <li className="flex items-center gap-2">
                    <img src={Check} alt="included" width={16} height={16} />
                    {card.pricepoint1}
                  </li>
                  <li className="flex items-center gap-2">
                    <img src={Check} alt="included" width={16} height={16} />
                    {card.pricepoint2}
                  </li>
                  <li className="flex items-center gap-2">
                    <img src={Check} alt="included" width={16} height={16} />
                    {card.pricepoint3}
                  </li>

                </ul>
              </div>
              {card.plantype === "Institutional (B2B)" ? (
                <a href="#contacts">

                  <div className={`mt-4 bg-white py-3 text-center ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}>Contact Us</div>
                </a>
              ) : card.plantype === "Free Trial" ? (
                <a href="#discover">
                  <div className={`mt-4 bg-white py-3 text-center ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}>Start Free Trial</div>
                </a>
              ) : (
                <button
                  onClick={() => handlePayment(card.price, card.plantype, card.duration)}
                  className={`mt-4 bg-white py-3 ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}
                  disabled={isPremium} // Disable button if user is already premium
                >
                  {isPremium ? "Subscribed" : card.pricebtn}

                  <div
                    className={`mt-4 bg-white py-3 text-center ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}
                  >
                    Contact Us
                  </div>
                </a>
              ) : (
                <button
                  className={`mt-4 bg-white py-3 ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}
                >
                  {card.pricebtn}

                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default Pricing;

export default Pricing;

