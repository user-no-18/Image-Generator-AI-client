import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [credit, setCredit] = useState(0);

  const backendUrl = import.meta.env.VITE_BACKEND;

  // Load credits when token changes
  useEffect(() => {
    console.log("Token changed:", token ? "exists" : "empty");
    if (token) {
      loadcreditData();
    } else {
      setUser(null);
      setCredit(0);
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setCredit(0);
    toast.info("Logged out successfully");
  };

  const generateImage = async (prompt) => {
    console.log("Generating image with prompt:", prompt);
    console.log("Token:", token);

    if (!token) {
      toast.error("Please login first!");
      setShowLogin(true);
      return null;
    }

    try {
      const { data } = await axios.post(
        backendUrl + "/api/image/generate-image",
        { prompt },
        {
          headers: { 
            token: token,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("Generate image response:", data);

      if (data.success) {
        loadcreditData();
        return data.resultImage;
      } else {
        toast.error(data.message);
        loadcreditData();
        if (data.creditBalance === 0) {
          toast.info("No credits left! Please purchase more.");
        }
        return null;
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(error.response?.data?.message || "Failed to generate image");
      return null;
    }
  };

  const loadcreditData = async () => {
    console.log("Loading credit data...");
    console.log("Backend URL:", backendUrl);
    console.log("Token:", token);

    if (!token) {
      console.log("No token available, skipping credit load");
      return;
    }

    try {
      const url = `${backendUrl}/api/user/credits`;
      console.log("Fetching from:", url);

      const { data } = await axios.get(url, {
        headers: { 
          token: token,
          'Content-Type': 'application/json'
        },
      });

      console.log("Credit data response:", data);

      if (data.success) {
        setCredit(data.credits);
        setUser(data.user);
        console.log("Credits loaded:", data.credits);
        console.log("User loaded:", data.user);
      } else {
        console.warn("Failed to load credits:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error loading credits:", error);
      console.error("Error response:", error.response?.data);
      
      // If token is invalid, logout user
      if (error.response?.status === 401 || error.response?.data?.message?.includes('token')) {
        console.log("Invalid token, logging out...");
        logout();
      } else {
        toast.error(error.response?.data?.message || "Failed to load credit data");
      }
    }
  };

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    token,
    setToken,
    backendUrl,
    credit,
    setCredit,
    logout,
    generateImage,
    loadcreditData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;