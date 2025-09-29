import React from "react";
import { stepsData } from "../assets/assets";
import {motion} from "framer-motion";
function Steps() {
  return (
    <motion.div className="flex flex-col items-center justify-center "
    initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}>
      <h1 className="text-3xl sm:text-4x1 font-semibold mb-2 text-amber-100 ">How it works</h1>
      <p className="text-lg text-amber-100 mb-8">
        Transform Words Into Stunning Images
      </p>
      <div className="space-y-4 w-full max-w-3xl text-sm'">
        {stepsData.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 p-5 px-8 bg-white/60 border-1 shadow-md  cursor-pointer hover: scale-[1.02] transition-all duration-300 text-pink-900">
            <img width={40} src={item.icon} alt="" />
            <div>
              <h2 className="text-xl font-medium">{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default Steps;
