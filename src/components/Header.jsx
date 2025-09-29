import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { motion } from "framer-motion";
import { AppContext } from "../contexts/AppContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const {user , setShowLogin} = useContext
  (AppContext);
  const navigate = useNavigate()
const onclickHandler=()=>{
  if(user){
   navigate('/result')
  }
  else{
    setShowLogin(true)
  }
}

  return (
    <motion.div
      className="flex flex-col justify-center items-center text-center my-20"
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        className="text-stone-500 inline-flex text-center gap-2
 px-6 py-1 rounded-full border border-neutral-500 "
        initial={{ opacity: 0.2, y: 100 }}
        transition={{ duration: 1 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <p>Generate Images in seconds</p>
        <img src={assets.star_icon} alt="" />
      </motion.div>
      <h1 className="text-4xl sm:text-7xl max-w-[300px] sm:max-w-[590px] mx-auto mt-10 text-center text-pink-500 font-bold">
        YOUR <span className="text-pink-800">AI POWERED</span>IMAGE GENERATOR
      </h1>
      <p className="text-center text-white/70 max-w-xl mx-auto mt-5">
       Unleash your creativity with AI. Go beyond imagination — generate stunning visuals, refine styles, and explore endless possibilities in seconds.
      </p>

      <button onClick={onclickHandler}
        className="sm: text-lg text-white bg-black w-auto
mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full cursor-pointer hover:scale-105
transition-all duration-500"
      >
        Generate Images
        <img className="h-6" src={assets.star_group} alt="" />
      </button>
     
     
    </motion.div>
  );
};

export default Header;
