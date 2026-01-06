"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiArrowRight, FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone, FiTwitter, FiYoutube, FiLinkedin } from "react-icons/fi";

const MotionImage = motion(Image);

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-[#374785] to-[#2a3562] text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PHBhdGggZD0iTTYwIDAgTDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3N2Zz4=')]"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10% w-20 h-20 bg-blue-500/10 rounded-full blur-xl"
          animate={{
            y: [0, 20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10% w-16 h-16 bg-purple-500/10 rounded-full blur-xl"
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-6">
            <motion.div 
              className="flex items-center gap-3 group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <MotionImage
                src="/assets/image/HMPTIlogo.png"
                alt="HMPTI Logo"
                width={60}
                height={60}
                className="rounded-lg bg-white/10 p-2 backdrop-blur-sm"
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  HMPTI UDB
                </h2>
                <p className="text-sm text-blue-200 font-medium">Informatics Community</p>
              </div>
            </motion.div>

            <p className="text-gray-300 leading-relaxed">
              Himpunan Mahasiswa Program Studi Teknik Informatika Universitas Duta Bangsa Surakarta - 
              Membangun komunitas teknologi yang inovatif dan kolaboratif.
            </p>

            <div className="flex gap-4">
              {[
                { icon: <FiFacebook size={20} />, href: "https://facebook.com", label: "Facebook" },
                { icon: <FiInstagram size={20} />, href: "https://instagram.com", label: "Instagram" },
                { icon: <FiTwitter size={20} />, href: "https://twitter.com", label: "Twitter" },
                { icon: <FiYoutube size={20} />, href: "https://youtube.com", label: "YouTube" },
                { icon: <FiLinkedin size={20} />, href: "https://linkedin.com", label: "LinkedIn" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className="p-3 bg-white/10 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-all duration-300 group"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-white group-hover:text-blue-200 transition-colors">
                    {social.icon}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Navigasi Cepat
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Event", path: "/pages/event", icon: <FiArrowRight size={16} /> },
                { name: "Fungsionaris", path: "/pages/fungsionaris", icon: <FiArrowRight size={16} /> },
                { name: "Berita", path: "/pages/news", icon: <FiArrowRight size={16} /> },
                { name: "Tentang Kami", path: "/pages/about", icon: <FiArrowRight size={16} /> },
                { name: "Galeri", path: "/pages/gallery", icon: <FiArrowRight size={16} /> },
              ].map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={link.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-3 group py-2"
                  >
                    <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {link.icon}
                    </span>
                    {link.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Divisi Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Divisi Kami
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Ketua & Wakil", path: "/pages/ketua" },
                { name: "Sekretaris", path: "/pages/sekretaris" },
                { name: "Bendahara", path: "/pages/bendahara" },
                { name: "Humas", path: "/pages/humas" },
                { name: "Kominfo", path: "/pages/kominfo" },
                { name: "Riset & Teknologi", path: "/pages/riset-teknologi" },
                { name: "Minat & Bakat", path: "/pages/minat-bakat" },
              ].map((division, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    href={division.path}
                    className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-3 group py-2"
                  >
                    <span className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    {division.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Hubungi Kami
            </h3>
            <ul className="space-y-4">
              {[
                { icon: <FiPhone className="flex-shrink-0" />, text: "(0271) 2256-8420" },
                { icon: <FiMail className="flex-shrink-0" />, text: "hmpti@udb.ac.id" },
                { 
                  icon: <FiMapPin className="flex-shrink-0 mt-1" />, 
                  text: "Jl. Bromo VII, Gebang RT02,RW16 Banjarsari, Surakarta, Jawa Tengah 57136" 
                },
              ].map((contact, index) => (
                <motion.li
                  key={index}
                  className="flex items-start gap-4 text-gray-300 hover:text-white transition-colors duration-300 group"
                  whileHover={{ x: 5 }}
                >
                  <span className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                    {contact.icon}
                  </span>
                  <span className="leading-relaxed">{contact.text}</span>
                </motion.li>
              ))}
            </ul>

           
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} <span className="text-blue-300">HMPTI UDB</span>. All rights reserved.
            </p>
            
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-300">
                Terms of Service
              </Link>
              <Link href="/sitemap" className="hover:text-white transition-colors duration-300">
                Sitemap
              </Link>
            </div>

            <p className="text-gray-400 text-sm">
              Developed by{" "}
              <Link 
                href="https://nexty.my.id" 
                className="text-blue-300 hover:text-blue-200 underline transition-colors duration-300"
              >
                NEXTY LABS
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}