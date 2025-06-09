import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import Check from "../../../../assets/check.svg";

function Pricing() {
  const { skillnaavData } = useSelector((state) => state.root);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [isPremium, setIsPremium] = useState(
    JSON.parse(localStorage.getItem("userInfo"))?.isPremium || false
  );
  const [sdkReady, setSdkReady] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!process.env.REACT_APP_PAYPAL_CLIENT_ID) {
      setAlert({
        show: true,
        message: "PayPal Client ID not set. Please check your .env file.",
        type: "error",
      });
      return;
    }

    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => {
      setAlert({
        show: true,
        message: "Failed to load PayPal SDK. Check your Client ID.",
        type: "error",
      });
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedPlanIndex === null || !paymentData || !sdkReady) return;

    const containerId = `paypal-button-container-${selectedPlanIndex}`;
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`No container found for PayPal button: ${containerId}`);
      return;
    }

    container.innerHTML = "";

    window.paypal
      .Buttons({
        createOrder: async () => {
          try {
            const orderRes = await axios.post("/api/payments/paypal/order", {
              amount: paymentData.amount,
              planType: paymentData.planType,
              duration: paymentData.duration,
              userId: paymentData.userInfo._id,
              email: paymentData.userInfo.email,
            });
            return orderRes.data.id;
          } catch (err) {
            console.error("Failed to create order:", err);
            showAlert("Unable to create PayPal order.", "error");
          }
        },
        onApprove: async (data) => {
          try {
            const verifyRes = await axios.post("/api/payments/paypal/verify", {
              orderID: data.orderID,
              amount: paymentData.amount,
              planType: paymentData.planType,
              duration: paymentData.duration,
              userId: paymentData.userInfo._id,
              email: paymentData.userInfo.email,
            });

            if (verifyRes.data.success) {
              showAlert("Payment verified successfully!", "success");
              paymentData.userInfo.isPremium = true;
              localStorage.setItem("userInfo", JSON.stringify(paymentData.userInfo));
              setIsPremium(true);
              setSelectedPlanIndex(null);
            } else {
              showAlert("Payment verification failed.", "error");
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            showAlert("Payment verification error.", "error");
          }
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          showAlert("Payment failed. Try again.", "error");
        },
      })
      .render(`#${containerId}`);
  }, [selectedPlanIndex, paymentData, sdkReady]);

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  const handlePayment = (amountString, planType, duration, index) => {
    if (!sdkReady) {
      showAlert("PayPal is still loading. Try again in a moment.", "error");
      return;
    }

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const amount = parseFloat(amountString.replace(/[^0-9.]/g, ""));

    setSelectedPlanIndex(index);
    setPaymentData({ amount, planType, duration, userInfo });
  };

  if (!skillnaavData) return <div>Loading…</div>;
  const { pricing, pricingcard } = skillnaavData;
  if (!pricing?.length || !pricingcard?.length) return <div>No pricing data available.</div>;

  return (
    <div id="pricing" className="py-12 my-12 pb-12 lg:py-16 relative">
      {alert.show && (
        <div
          className={`fixed top-4 right-4 border-l-4 p-4 ${
            alert.type === "success"
              ? "bg-green-100 border-green-400 text-green-700"
              : "bg-red-100 border-red-400 text-red-700"
          } rounded-lg shadow-lg z-50`}
          role="alert"
        >
          <p className="font-medium">{alert.message}</p>
        </div>
      )}

      <h1 className="text-center font-medium text-2xl lg:text-4xl text-gray-900 mb-6">
        {pricing[0].priceheading}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        {pricingcard.map((card, index) => {
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
          const colorClass = Object.values(colorClasses)[index % 3];

          return (
            <div
              key={index}
              className={`w-full ${colorClass.bg} p-6 flex flex-col justify-between shadow-lg rounded-lg`}
              style={{ marginTop: "20px" }}
            >
              <div>
                <h3 className={`font-medium ${colorClass.text} text-xl lg:text-2xl`}>
                  {card.plantype}
                </h3>
                <p className={`pt-3 ${colorClass.subtext} lg:text-lg`}>
                  {card.plantypesubhead}
                </p>
                <h2 className={`pt-4 text-2xl font-medium ${colorClass.text} lg:text-3xl`}>
                  {card.plantype === "Institutional (B2B)" ? (
                    <span className="text-orange-700">Contact Us</span>
                  ) : (
                    card.price
                  )}
                </h2>
                <p className={`pt-2 ${colorClass.subtext} lg:text-lg`}>
                  Duration: {card.duration} month
                </p>
                <ul className={`flex flex-col gap-2 pt-4 ${colorClass.subtext}`}>
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
              ) : card.plantype === "Free Trial" ? (
                <a href="#discover">
                  <div
                    className={`mt-4 bg-white py-3 text-center ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}
                  >
                    Start Free Trial
                  </div>
                </a>
              ) : (
                <>
                  <button
                    onClick={() =>
                      handlePayment(card.price, card.plantype, card.duration, index)
                    }
                    className={`mt-4 bg-white py-3 text-center ${colorClass.text} font-medium rounded ${colorClass.hoverBg} transition`}
                    disabled={isPremium}
                  >
                    {isPremium ? "Subscribed" : card.pricebtn}
                  </button>

                  {selectedPlanIndex === index && (
                    <div id={`paypal-button-container-${index}`} className="mt-4"></div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Pricing;
