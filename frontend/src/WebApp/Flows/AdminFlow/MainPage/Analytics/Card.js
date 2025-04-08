import React from "react";

const Card = ({ icon, title, count, color }) => (
  <div className={`${color} p-6 rounded-lg shadow-lg flex items-center`}>
    <div className="mr-4">{icon}</div>
    <div>
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  </div>
);

export default Card;
