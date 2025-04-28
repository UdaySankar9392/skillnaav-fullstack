// components/OfferLetters.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import OfferLetterCard from "./OfferLetterCard";

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
        // wrap singleton in array
        const data = Array.isArray(res.data) ? res.data : [res.data];
        setOffers(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load offer letters.");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [studentId]);

  if (loading) return <p>Loading offer letters…</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (offers.length === 0) return <p>No offer letters available.</p>;

  return (
    <div className="p-4 font-poppins">
      <h2 className="text-xl font-semibold mb-4">Your Offer Letters</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <OfferLetterCard
            key={offer._id}
            offer={offer}
            onStatusChange={(newStatus) =>
              setOffers((prev) =>
                prev.map((o) => (o._id === offer._id ? { ...o, status: newStatus } : o))
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default OfferLetters;
