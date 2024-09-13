import React from "react";
import Check from "../assets/check.svg";
import { useSelector } from "react-redux";

function Pricing() {
  const { skillnaavData } = useSelector((state) => state.root);

  if (!skillnaavData) {
    return <div>Loading...</div>; // Add loading state if skillnaavData is null
  }

  const { pricing, pricingcard } = skillnaavData;

  if (
    !pricing ||
    pricing.length === 0 ||
    !pricingcard ||
    pricingcard.length === 0
  ) {
    return <div>No pricing data available.</div>;
  }

  const { priceheading } = pricing[0];

  const colorClasses = {
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
