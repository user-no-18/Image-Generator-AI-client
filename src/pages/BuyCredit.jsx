// src/pages/BuyCredit.jsx
import React, { useContext, useEffect, useState } from "react";
import { assets, plans } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function BuyCredit() {
  const { user, backendUrl, loadcreditData, token, setShowLogin } =
    useContext(AppContext);
  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] = useState(null);
  const [scriptLoaded, setScriptLoaded] = useState(!!window.Razorpay);

  // Load Razorpay script
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
    if (!window.Razorpay) {
      loadRazorpayScript().catch((err) => {
        console.warn("Razorpay script load failed:", err);
      });
    }
  }, []);

  const getAuthHeaders = () => {
    const savedToken = token || localStorage.getItem("token");
    console.log('Getting auth headers, token:', savedToken ? 'exists' : 'missing');
    
    if (!savedToken) return null;
    
    // Return both formats for maximum compatibility
    return {
      'Authorization': `Bearer ${savedToken}`,
      'token': savedToken,
      'Content-Type': 'application/json'
    };
  };

  const paymentRazorpay = async (planId) => {
    console.log("=== Payment Initiated ===");
    console.log("Plan ID:", planId);
    console.log("Backend URL:", backendUrl);
    console.log("User:", user);
    console.log("Token from context:", token);
    console.log("Token from localStorage:", localStorage.getItem("token"));

    // Ensure user is logged in
    if (!user) {
      toast.error("Please login first!");
      setShowLogin(true);
      return;
    }

    const authHeaders = getAuthHeaders();
    if (!authHeaders) {
      toast.error("Please login again!");
      setShowLogin(true);
      return;
    }

    // Ensure Razorpay SDK is loaded
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
      console.log("POST to:", url);
      console.log("Headers:", authHeaders);
      console.log("Body:", { planId });

      const { data } = await axios.post(
        url,
        { planId },
        { headers: authHeaders }
      );

      console.log("Response from backend:", data);

      if (data && data.success) {
        initPay(data.order, data.key, authHeaders);
      } else {
        toast.error(data?.message || "Failed to initialize payment");
      }
    } catch (error) {
      console.error("Full Axios Error:", error);
      console.error("Error response:", error.response?.data);
      const message =
        error?.response?.data?.message || error?.message || "Unknown error";
      toast.error(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const initPay = (order, key, authHeaders) => {
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
      order_id: order.id,
      handler: async function (response) {
        try {
          const verifyUrl = `${backendUrl}/api/user/verify-razor`;
          console.log("Verifying payment:", verifyUrl, response);
          
          const verifyData = await axios.post(
            verifyUrl,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: authHeaders }
          );

          console.log("Verify response:", verifyData?.data);

          if (verifyData?.data?.success) {
            toast.success("Payment successful! Credits added to your account.");
            if (typeof loadcreditData === "function") {
              loadcreditData();
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
              className="w-full min-w-52 bg-gray-800 text-white mt-8 text-sm rounded-md py-2.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
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