import React, { createContext, useEffect, useState } from "react";
import Try from "../components/Try";
import { toast } from "react-toastify";
import axios from "axios";
export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [credit, setCredit] = useState(false);


  const backendUrl = import.meta.env.VITE_BACKEND;
  useEffect(() => {
    if (token) {
      loadcreditData();
    }
  }, [token]);
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };
  console.log("Backend URL:", backendUrl);

  
  const generateImage = async (prompt) => {
  console.log("Sending prompt to backend:", prompt); // Debug

  try {
    const { data } = await axios.post(
      backendUrl + "/api/image/generate-image",
      { prompt },
      {
        headers: { token },
      }
    );

    console.log("Backend response:", data); // Debug

    if (data.success) {
      loadcreditData();
      return data.resultImage;
    } else {
      toast.error(data.message);
      loadcreditData();
      if (data.creditBalance === 0) {
        navigate("/buy");
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
    toast.error("Something went wrong while generating the image");
  }
};



  const loadcreditData = async () => {
  console.log("🔁 loadcreditData called");

  try {
    const url = `${backendUrl}/api/user/credits`;
    console.log("📡 Sending GET to:", url);
    console.log("🪪 Token:", token);

    const { data } = await axios.get(url, {
      headers: { token },
    });

    console.log("📥 Response from /credits:", data);
    if (data.success) {
      setCredit(data.credits); // credit**s**
      setUser(data.user);
      console.log("✅ Credit set to:", data.credits);
      console.log("👤 User set to:", data.user);
    } else {
      console.warn("⚠️ Credit fetch failed:", data.message);
      toast.error(data.message);
    }
  } catch (error) {
    console.error("❌ Error in loadcreditData:", error);
    toast.error(error.message || "Failed to load credit data");
  }
};

  
  const value = {
  user,
  setUser,
  showLogin,
  setShowLogin,
  token,              // ✅ FIX: pass token here
  setToken,
  backendUrl,
  credit,
  setCredit,
  logout,
  generateImage,
  loadcreditData,     // ✅ FIX: so BuyCredit.jsx can reload credits
};
  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
