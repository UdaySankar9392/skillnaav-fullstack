import React from "react";
import { useSelector } from "react-redux";

const Vision = () => {
  const { skillnaavData } = useSelector((state) => state.root);

  if (
    !skillnaavData ||
    !skillnaavData.visionhead ||
    !skillnaavData.visionpoint
  ) {
    return null;
  }

  const { visionhead, visionpoint } = skillnaavData;

  return (
    <section
      id="vision"
      className="py-8 lg:py-16 bg-gray-100 my-16 text-gray-800"
    >
      <div className="container mx-auto px-4 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="mb-8 md:mb-0">
            <img
              src={visionhead[0].visionImg}
              alt="Vision"
              className="rounded-lg shadow-lg object-cover w-full h-auto md:w-auto lg:w-auto"
            />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 lg:mb-6 text-center">
              {visionhead[0].visionheading}
            </h2>
            <p className="text-lg lg:text-xl font-medium mb-6 max-w-3xl mx-auto">
              {visionhead[0].visionsub}
            </p>
            <ul className="list-disc text-base lg:text-lg max-w-2xl mx-auto pl-5">
              {visionpoint.map((point, index) => (
                <li key={index} className="mb-3 font-normal">
                  {point.visionpoint}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Vision;
