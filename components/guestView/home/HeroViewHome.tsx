"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaLightbulb, FaRocket, FaUsers } from "react-icons/fa";
import { IoArrowForward, IoSparkles } from "react-icons/io5";

export default function HeroViewHome() {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { threshold: 0.4 });

    const el = document.getElementById("hero-section");
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);
  return (
    <div
      id="hero-section"
      className="relative flex items-center justify-center w-full min-h-screen overflow-hidden px-4 pt-6 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900"
    >
      {/* Notion-style background with animated grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2QxZDVmMSIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>

        {/* Animated floating shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-300/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent"></div>
      </div>

      <div className="relative z-10 container mx-auto py-12 md:py-24 max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Content section with Notion-style blocks */}
          <motion.div
            className="w-full lg:w-7/12 space-y-6 md:space-y-8"
            initial={{ opacity: 0, transform: "translateY(20px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Badge with icon */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700">Organisasi Mahasiswa Aktif</span>
            </motion.div>

            {/* Main heading with gradient */}
            <div className="space-y-4">
              <motion.h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900"
                initial={{ opacity: 0, transform: "translateY(10px)" }}
                animate={{ opacity: 1, transform: "translateY(0px)" }}
                transition={{ delay: 0.6 }}
              >
                <span className="block">Himpunan Mahasiswa</span>
                <span className="block bg-gradient-to-r from-[#374785] via-blue-600 to-cyan-600 text-transparent bg-clip-text mt-2">Teknik Informatika</span>
              </motion.h1>

              {/* University name with icon */}
              <motion.div
                className="flex items-center gap-3 text-xl font-medium pl-3 border-l-4 border-blue-400 text-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <IoSparkles className="text-blue-400" />
                Universitas Duta Bangsa
              </motion.div>
            </div>

            {/* Description with icon */}
            <motion.div
              className="text-lg leading-relaxed py-2 text-gray-600 pl-2 border-l-2 border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              <div className="flex items-start gap-3">
                <FaLightbulb className="text-blue-400 mt-1 flex-shrink-0" />
                <p>Wadah pengembangan diri bagi mahasiswa Teknik Informatika melalui kegiatan akademik, sosial, dan pengembangan karir.</p>
              </div>
            </motion.div>

            {/* Button group */}
            <motion.div className="flex flex-wrap gap-4 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
              <div className="transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                <Link
                  href="/pages/fungsionaris"
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-shadow duration-300 group bg-gradient-to-r from-[#374785] to-blue-600 text-white hover:shadow-lg hover:shadow-blue-500/25"
                >
                  <span>Tentang HMPTI</span>
                  <IoArrowForward className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
                <Link
                  href="/pages/event"
                  className="flex items-center gap-3 px-8 py-4 rounded-xl font-medium border-2 transition-colors duration-300 bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                >
                  <FaRocket className="text-blue-500" />
                  <span>Lihat Event</span>
                </Link>
              </div>
            </motion.div>

            {/* Stats section */}
            <motion.div className="flex flex-wrap gap-6 pt-8 border-t border-gray-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaUsers className="text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">40+</div>
                  <div className="text-sm text-gray-500">Anggota Aktif</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaRocket className="text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">15+</div>
                  <div className="text-sm text-gray-500">Kegiatan</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaLightbulb className="text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">10+</div>
                  <div className="text-sm text-gray-500">Proyek</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Logo section with floating animation */}
          <motion.div
            className="w-full lg:w-5/12"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <div className="relative group">
              {/* Main card */}
              <div className="relative bg-white rounded-2xl p-8 shadow-2xl will-change-transform shadow-blue-500/10 border border-gray-100 transform group-hover:shadow-2xl group-hover:shadow-blue-500/20 transition-all duration-500">
                {/* Decorative elements */}
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-blue-500 rounded-full"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-cyan-500 rounded-full"></div>

                {/* Logo container */}
                <div className="relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-gray-100">
                  <img
                    src="/assets/image/LogoHMPTI.png"
                    alt="HMPTI Logo"
                    className="w-full max-w-xs h-auto object-contain transform group-hover:scale-105 transition-transform duration-700 will-change-transform"
                  />

                  {/* Floating particles */}
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="absolute bottom-2 left-2 w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
                </div>

                {/* Caption with icon */}
                <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-600">
                  <IoSparkles className="text-blue-400" />
                  <span className="text-sm font-medium">Wadah bagi masa depan teknologi Indonesia</span>
                </div>
              </div>

              {/* Background decorative element */}
              <div className="absolute -z-10 -inset-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ transform: ["translateY(0px)", "translateY(10px)", "translateY(0px)"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </div>
      </motion.div>
    </div>
  );
}
