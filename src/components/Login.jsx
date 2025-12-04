import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { assets } from "../assets/assets";
import { AppContext } from "../contexts/AppContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const Login = () => {
  
   const navigate = useNavigate()
  const [state, setState] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setShowLogin, backendUrl, setToken, setUser } =
    useContext(AppContext);

  const onsubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (state === "Login") {
        const { data } = await axios.post(backendUrl + "/api/user/login", {
         email,password
        });

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem("token", data.token);
          setShowLogin(false);
           navigate("/")
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        if (data.success) {
          setToken(data.token);
          setUser(data.user);
          localStorage.setItem("token", data.token);
          setShowLogin(false);
           navigate("/")
        } else {
         
          toast.error(data.message);
        }
      }
    } catch (error) {
  console.log("AXIOS ERROR:", error); // 
        toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={onsubmitHandler}
        className="relative bg-white p-8 rounded-xl shadow-xl max-w-xs w-[90%]  text-slate-600"
      >
        <h1 className="text-2xl font-semibold text-center text-neutral-800 mb-1">
          {state}
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Welcome back! Please sign in to continue
        </p>

        {/* Full Name */}
        {state !== "Login" && (
          <div className="flex items-center gap-3 border px-4 py-2 rounded-full mb-4">
            <img
              src={assets.profile_icon}
              alt="Full Name"
              className="w-5 h-5"
            />
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Full Name"
              required
              className="flex-1 outline-none bg-transparent text-sm"
            />
          </div>
        )}
        {/* Email */}
        <div className="flex items-center gap-3 border px-4 py-2 rounded-full mb-4">
          <img src={assets.email_icon} alt="Email" className="w-5 h-5" />
          <input
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email id"
            required
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 border px-4 py-2 rounded-full mb-6">
          <img src={assets.lock_icon} alt="Password" className="w-5 h-5" />
          <input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            className="flex-1 outline-none bg-transparent text-sm"
          />
        </div>
        <p className="my-2 ml-2 text-black/70 font-semibold cursor-pointer hover:underline">
          Forgot password?
        </p>

        <button 
          type="submit"
          className="w-full py-3 bg-black text-white rounded-full hover:bg-neutral-800 transition"
        >
          {state === "Login" ? "Login" : "Sign Up"}
        </button>
        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Sign Up")}
            >
              Sign Up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => setState("Login")}
            >
              login
            </span>
          </p>
        )}

        <img
          src={assets.cross_icon}
          className="absolute top-5 right-5 cursor-pointer "
          onClick={() => setShowLogin(false)}
        />
      </form>
    </div>
  );
};

export default Login;
