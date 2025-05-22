import React, { useEffect, useState } from "react";
import axios from "axios";
import OfferLetterCard from "./OfferLetterCard";
import { Skeleton } from "antd"; // ✅ Import from antd

const OfferLetters = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const studentId = userInfo?._id;

  useEffect(() => {
    const fetchOffers = async () => {
      if (!studentId) {
        setError("Student ID not found. Please log in.");
        setLoading(false);
        return;
      }
    try {
  const res = await axios.get(`/api/offer-letters/${studentId}`);
  const data = Array.isArray(res.data) ? res.data : [res.data];
  setOffers(data);
} catch (err) {
  if (err.response?.status === 404) {
    setOffers([]); // No offer letters found
  } else {
    console.error(err);
    setError("Failed to load offer letters.");
  }
} finally {
  setLoading(false); // ✅ Always stop loading
}
    };
    fetchOffers();
  }, [studentId]);

  return (
    <div className="p-4 font-poppins">
      <h2 className="text-xl font-semibold mb-4">Your Offer Letters</h2>

     {loading && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 border rounded shadow-sm bg-white">
          <Skeleton active />
        </div>
      ))}
    </div>
  )}

  {error && <p className="text-red-500 font-medium">{error}</p>}

  {!loading && !error && offers.length === 0 && (
    <p className="text-gray-600 italic">No offer letters yet. Please check back later.</p>
  )}

  {!loading && !error && offers.length > 0 && (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {offers.map((offer) => (
        <OfferLetterCard
          key={offer._id}
          offer={offer}
          onStatusChange={(newStatus) =>
            setOffers((prev) =>
              prev.map((o) =>
                o._id === offer._id ? { ...o, status: newStatus } : o
              )
            )
          }
        />
      ))}
    </div>
  )}
</div>

  );
};

export default OfferLetters;
