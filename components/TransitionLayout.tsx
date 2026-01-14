"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TransitionLayout() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 900); // durasi animasi

    return () => clearTimeout(timer);
  }, []); // ⬅️ hanya sekali saat Home mount

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ transform: "translateX(100%)" }}
          animate={{ transform: "translateX(0%)" }}
          exit={{ transform: "translateX(-100%)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#374785] will-change-transform pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}
