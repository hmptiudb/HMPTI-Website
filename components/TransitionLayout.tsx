"use client";

import { motion } from "framer-motion";

export default function TransitionLayout() {
  return (
    <div>
      <motion.div
        initial={{ x: "100%", height: "100%" }}
        animate={{ x: "0%", height: "100%" }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
        className="fixed  top-0 bottom-0 right-full w-[100%] h-full z-50 bg-[#374785]"
      />
      <motion.div
        initial={{ x: "100%", height: "100%" }}
        animate={{ x: "0%", height: "100%" }}
        transition={{ delay: 0.2, duration: 0.9, ease: "easeInOut" }}
        className="fixed  top-0 bottom-0 right-full w-screen h-full z-40 bg-black"
      />
      <motion.div
        initial={{ x: "100%", height: "100%" }}
        animate={{ x: "0%", height: "100%" }}
        transition={{ delay: 0.4, duration: 0.9, ease: "easeInOut" }}
        className="fixed  top-0 bottom-0 right-full w-screen h-full z-30 bg-white"
      />
    </div>
  );
}
