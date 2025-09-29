import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppContext } from "../contexts/AppContext";

const Navbar = () => {
  const { credit, setShowLogin, user, logout } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4">
      <Link to="/"   className="flex items-center gap-2">
        <img src={assets.logo_icon} alt="" className="w-28  lg:w-10" />
       <p style={{fontFamily: 'Lobster, cursive'}} 
   className="text-2xl  font-extrabold text-pink-500 tracking-widest">
  PIXIO
</p>


      </Link>
      <div>
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/buy")}
              className="flex items-center gap-2 bg-pink-800 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700"
            >
              <img src={assets.credit_star} className="w-5" />
              <p className="text-xs sm:text-sm font-medium text-white text-bold">
                credit left : {credit}
              </p>
            </button>
            <p className="text-xs sm:text-sm text-white">Hii, {user.name}</p>
            <div className="relative group">
              <img src={assets.profile_icon} className="w-10 drop-shadow" />
              <div className="absolute hidden  group-hover:block top-0 right-0 z-10 text-black rounded pt-12">
                <ul onClick={logout} className="list-none m-0 p-2 bg-white rounded-md border-none text-sm cursor-pointer ">
                  Logout
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-5 text-white">
            <p onClick={() => navigate("/buy")} className="cursor-pointer text-white">
              pricing
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-zinc-800 text-white px-7 py-2 sm:px-10 text-sm rounded-full"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
