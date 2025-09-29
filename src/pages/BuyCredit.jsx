// src/pages/BuyCredit.jsx
import React, { useContext, useEffect, useState } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

/**
 * BuyCredit component
 * - Uses token from context or localStorage fallback
 * - Sends token as Authorization: Bearer <token>
 * - Loads Razorpay script dynamically if needed
 * - Handles create-order and verify-payment flows
 */
function BuyCredit() {
  const { user, backendUrl, loadcreditData, token, setShowLogin } =
    useContext(AppContext);
  const navigate = useNavigate();

  // hold loading state per plan to disable multiple clicks
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.Razorpay);

  // helper to load Razorpay checkout script
  const loadRazorpayScript = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) {
        setScriptLoaded(true);
        return resolve(true);
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setScriptLoaded(true);
        resolve(true);
      };
      script.onerror = () => reject(new Error("Razorpay SDK failed to load"));
      document.body.appendChild(script);
    });

  useEffect(() => {
    // Try to load Razorpay SDK in background so it's ready when user clicks
    if (!window.Razorpay) {
      loadRazorpayScript().catch((err) => {
        console.warn("Razorpay script load failed:", err);
      });
    }
  }, []);

  const getAuthHeader = () => {
    // prefer context token, fallback to localStorage
    const savedToken = token || localStorage.getItem("token");
    if (!savedToken) return null;
    return { Authorization: `Bearer ${savedToken}` };
  };

  const paymentRazorpay = async (planId) => {
    console.log("Initiating payment for plan:", planId);
    console.log("Backend URL:", backendUrl);

    // ensure user logged in
    if (!user) {
      setShowLogin(true);
      return;
    }

    const authHeader = getAuthHeader();
    if (!authHeader) {
      toast.error("Please login again!");
      setShowLogin(true);
      return;
    }

    // ensure Razorpay SDK present
    try {
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }
    } catch (err) {
      console.error("Razorpay SDK error:", err);
      toast.error("Payment SDK failed to load. Refresh and try again.");
      return;
    }

    setLoadingPlan(planId);
    try {
      const url = `${backendUrl}/api/user/pay-razor`;
      console.log("POST", url, "planId:", planId);
      const { data } = await axios.post(
        url,
        { planId },
        { headers: authHeader }
      );

      console.log("Response from backend:", data);

      if (data && data.success) {
        // pass authHeader token down to initPay so verify uses same token
        initPay(data.order, data.key, authHeader);
      } else {
        toast.error(data?.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Full Axios Error:", error);
      const message =
        error?.response?.data?.message || error?.message || "Unknown error";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  // initPay now receives authHeader for verify step
  const initPay = (order, key, authHeader) => {
    if (!order || !key) {
      toast.error("Invalid order/key from server");
      return;
    }

    const options = {
      key: key,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "AI Text to Image",
      description: "Credits Purchase",
      order_id: order.id, // razorpay order id
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyUrl = `${backendUrl}/api/user/verify-razor`;
          console.log("Verifying payment:", verifyUrl, response);
          const verifyData = await axios.post(
            verifyUrl,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: authHeader }
          );

          console.log("Verify response:", verifyData?.data);

          if (verifyData?.data?.success) {
            toast.success("Payment successful! Credits added to your account.");
            // refresh user credits
            if (typeof loadcreditData === "function") {
              loadcreditData();
            } else {
              // fallback: navigate to buy or refresh
              console.warn("loadcreditData not available in context");
            }
          } else {
            toast.error(verifyData?.data?.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          const msg = error?.response?.data?.message || error?.message || "Verification failed";
          toast.error(msg);
        }
      },
      prefill: {
        name: user?.name || "User",
        email: user?.email || "user@example.com",
        contact: user?.phone || "9999999999",
      },
      theme: {
        color: "#1f2937",
      },
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      console.error("Razorpay payment.failed:", response);
      toast.error("Payment failed: " + (response?.error?.description || "Unknown error"));
    });

    rzp.open();
  };

  return (
    <div className="min-h-[80vh] pt-14 mb-10 text-center">
      <button className="border border-gray-400 px-10 py-2 rounded-full mb-6">
        Our Plans
      </button>
      <h1 className="text-3xl font-medium mb-6 sm:mb-10 text-center">
        Choose the plan
      </h1>

      <div className="flex flex-wrap gap-6 justify-center text-left">
        {plans.map((item, index) => (
          <div
            className="bg-white drop-shadow-sm rounded-lg py-12 px-8 text-gray-600 hover:scale-105 transition-all"
            key={index}
          >
            <img width={40} src={assets.logo_icon} alt="logo" />
            <p className="mt-3 mb-3 font-semibold">{item.id}</p>
            <p className="text-sm">{item.desc}</p>
            <p className="mt-6">
              <span className="text-3xl font-medium">${item.price} </span> / {item.credits}{" "}
              credits
            </p>
            <button
              onClick={() => paymentRazorpay(item.id)}
              className="w-full min-wi-52 bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5"
              disabled={loadingPlan === item.id}
            >
              {loadingPlan === item.id ? "Processing..." : user ? "Purchase" : "Get Started"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BuyCredit;
