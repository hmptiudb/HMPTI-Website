"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiUser, FiCalendar, FiUsers, FiBookOpen } from "react-icons/fi";
import { FaHome } from "react-icons/fa";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const navLinks = [
    { 
      name: "Beranda", 
      path: "/", 
      key: "home",
      icon: <FaHome className="text-lg" />
    },
    { 
      name: "Event", 
      path: "/pages/event", 
      key: "event",
      icon: <FiCalendar className="text-lg" />
    },
    { 
      name: "Fungsionaris", 
      path: "/pages/fungsionaris", 
      key: "fungsionaris",
      icon: <FiUsers className="text-lg" />
    },
    { 
      name: "Berita", 
      path: "/pages/news", 
      key: "news",
      icon: <FiBookOpen className="text-lg" />
    },
  ];

  // Dropdown items for fungsionaris
  const fungsionarisItems = [
    { name: "Fungsionaris", path: "/pages/fungsionaris/" },
    { name: "Ketua & Wakil", path: "/pages/fungsionaris/ketua-wakil" },
    { name: "Sekretaris", path: "/pages/fungsionaris/sekretaris" },
    { name: "Bendahara", path: "/pages/fungsionaris/bendahara" },
    { name: "Humas", path: "/pages/fungsionaris/humas" },
    { name: "Kominfo", path: "/pages/fungsionaris/kominfo" },
    { name: "Riset & Teknologi", path: "/pages/fungsionaris/riset-dan-teknologi" },
    { name: "Minat & Bakat", path: "/pages/fungsionaris/minat-dan-bakat" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  if (pathname.startsWith("/admin")) return null;

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
      isScrolled 
        ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-100/50" 
        : "bg-transparent"
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 group relative"
          >
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image 
                src="/assets/image/HMPTIlogo.png" 
                alt="HMPTI Logo" 
                fill 
                className="object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                HMPTI
              </span>
              <span className="text-xs text-gray-500 font-medium">DUTA BANGSA</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <div key={link.key} className="relative group">
                {link.key === "fungsionaris" ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(link.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        pathname.startsWith("/pages/") && pathname !== "/"
                          ? "text-blue-600 bg-blue-50/80"
                          : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                      } group-hover:text-blue-600`}
                    >
                      {link.icon}
                      {link.name}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${
                          activeDropdown === link.key ? "rotate-180" : ""
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className={`absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 overflow-hidden transition-all duration-300 ${
                      activeDropdown === link.key 
                        ? "opacity-100 translate-y-0 visible" 
                        : "opacity-0 -translate-y-2 invisible"
                    }`}>
                      <div className="p-2">
                        {fungsionarisItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-200"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <Link
                    href={link.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                      pathname === link.path
                        ? "text-blue-600 bg-blue-50/80 shadow-inner"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

     

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-500 ease-out ${
        mobileMenuOpen 
          ? "max-h-screen opacity-100 translate-y-0" 
          : "max-h-0 opacity-0 -translate-y-4 overflow-hidden"
      }`}>
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-xl">
          <div className="container mx-auto px-4 py-6">
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <div key={link.key}>
                  {link.key === "fungsionaris" ? (
                    <>
                      <button
                        onClick={() => toggleDropdown(link.key)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          {link.icon}
                          {link.name}
                        </div>
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${
                            activeDropdown === link.key ? "rotate-180" : ""
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Mobile Dropdown */}
                      <div className={`pl-8 mt-2 space-y-2 transition-all duration-300 ${
                        activeDropdown === link.key 
                          ? "max-h-96 opacity-100" 
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}>
                        {fungsionarisItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.path}
                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-200"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link
                      href={link.path}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      {link.icon}
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile Login Button */}
              <div className="pt-4 border-t border-gray-100/50 mt-4">
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                  <FiUser className="text-lg" />
                  Login
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}