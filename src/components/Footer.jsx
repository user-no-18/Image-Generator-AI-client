import React from "react";
import { assets } from "../assets/assets";
const Footer = () => {
  return (
    <div
      className="flex items-center justify-between gap-2 py-3 "
    >
      <img src={assets.logo_icon} alt="" width={30} />
      <p
        className="flex-1 border-l border-gray-400 pl-4 text-sm
text-gray-500 "
      >
        © 2025 Pixio | All Rights Reserved.
      </p>

      <div className="flex gap-2.5">
        <img src={assets.facebook_icon} alt="" width={35} />
        <img src={assets.twitter_icon} alt="" width={35} />
        <img src={assets.instagram_icon} alt="" width={35} />
      </div>
    </div>
  );
};

export default Footer;
