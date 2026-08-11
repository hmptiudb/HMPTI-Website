"use client";

import Image from "next/image";
import Link from "next/link";

import { usePathname } from "next/navigation";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { FiBookOpen, FiCalendar, FiChevronDown, FiMenu, FiUsers, FiX } from "react-icons/fi";

import { FaHome } from "react-icons/fa";

// =========================================================
// TYPES
// =========================================================

interface NavigationItem {
  name: string;

  path: string;

  key: string;

  icon: ReactNode;
}

interface FungsionarisItem {
  name: string;

  path: string;
}

// =========================================================
// NAVIGATION
// =========================================================

const NAV_LINKS: NavigationItem[] = [
  {
    name: "Beranda",
    path: "/",
    key: "home",
    icon: <FaHome className="text-base" />,
  },
  {
    name: "Event",
    path: "/pages/event",
    key: "event",
    icon: <FiCalendar className="text-base" />,
  },
  {
    name: "Fungsionaris",
    path: "/pages/fungsionaris",
    key: "fungsionaris",
    icon: <FiUsers className="text-base" />,
  },
  {
    name: "Berita",
    path: "/pages/news",
    key: "news",
    icon: <FiBookOpen className="text-base" />,
  },
];

const FUNGSIONARIS_ITEMS: FungsionarisItem[] = [
  {
    name: "Semua Fungsionaris",
    path: "/pages/fungsionaris",
  },
  {
    name: "Ketua & Wakil",
    path: "/pages/fungsionaris/ketua-wakil",
  },
  {
    name: "Sekretaris",
    path: "/pages/fungsionaris/sekretaris",
  },
  {
    name: "Bendahara",
    path: "/pages/fungsionaris/bendahara",
  },
  {
    name: "Humas",
    path: "/pages/fungsionaris/humas",
  },
  {
    name: "Kominfo",
    path: "/pages/fungsionaris/kominfo",
  },
  {
    name: "Riset & Teknologi",
    path: "/pages/fungsionaris/riset-dan-teknologi",
  },
  {
    name: "Minat & Bakat",
    path: "/pages/fungsionaris/minat-dan-bakat",
  },
];

// =========================================================
// COMPONENT
// =========================================================

export default function Navbar() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [desktopDropdownOpen, setDesktopDropdownOpen] = useState(false);

  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // =======================================================
  // HIDE ON ADMIN
  // =======================================================

  const isAdminPage = pathname.startsWith("/admin");

  // =======================================================
  // ACTIVE ROUTE
  // =======================================================

  const isRouteActive = (path: string, key: string) => {
    if (key === "home") {
      return pathname === "/";
    }

    if (key === "fungsionaris") {
      return pathname.startsWith("/pages/fungsionaris");
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // =======================================================
  // SCROLL
  // =======================================================

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // =======================================================
  // CLOSE ON ROUTE CHANGE
  // =======================================================

  useEffect(() => {
    setMobileMenuOpen(false);

    setDesktopDropdownOpen(false);

    setMobileDropdownOpen(false);
  }, [pathname]);

  // =======================================================
  // MOBILE SCROLL LOCK
  // =======================================================

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // =======================================================
  // ESCAPE
  // =======================================================

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);

        setDesktopDropdownOpen(false);

        setMobileDropdownOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =======================================================
  // CLICK OUTSIDE DROPDOWN
  // =======================================================

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }

      if (dropdownRef.current.contains(event.target as Node)) {
        return;
      }

      setDesktopDropdownOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  if (isAdminPage) {
    return null;
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <>
      <header
        className={`
          fixed
          inset-x-0
          top-0
          z-50
          border-b
          transition-all
          duration-300

          ${
            isScrolled || mobileMenuOpen
              ? `
                border-gray-200/80
                bg-white/95
                shadow-sm
                backdrop-blur-xl
              `
              : `
                border-transparent
                bg-white/80
                backdrop-blur-md
              `
          }
        `}
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4

            sm:px-6

            lg:px-8
          "
        >
          <div
            className="
              flex
              h-16
              items-center
              justify-between

              md:h-20
            "
          >
            {/* =====================================
                LOGO
            ====================================== */}

            <Link
              href="/"
              aria-label="HMPTI Universitas Duta Bangsa"
              className="
                group
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <div
                className="
                  relative
                  h-10
                  w-10
                  shrink-0

                  md:h-11
                  md:w-11
                "
              >
                <Image
                  src="/assets/image/HMPTIlogo.png"
                  alt="Logo HMPTI"
                  fill
                  priority
                  sizes="44px"
                  className="
                    object-contain
                    transition-transform
                    duration-300

                    group-hover:scale-105
                  "
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-lg
                    font-extrabold
                    tracking-tight
                    text-gray-900
                  "
                >
                  HMPTI
                </p>

                <p
                  className="
                    -mt-0.5
                    truncate
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-gray-400

                    sm:text-[11px]
                  "
                >
                  Universitas Duta Bangsa
                </p>
              </div>
            </Link>

            {/* =====================================
                DESKTOP NAVIGATION
            ====================================== */}

            <nav
              aria-label="Navigasi utama"
              className="
                hidden
                items-center
                gap-1

                lg:flex
              "
            >
              {NAV_LINKS.map((link) => {
                const isActive = isRouteActive(link.path, link.key);

                // ===============================
                // FUNGSIONARIS
                // ===============================

                if (link.key === "fungsionaris") {
                  return (
                    <div key={link.key} ref={dropdownRef} className="relative">
                      <button
                        type="button"
                        onClick={() => setDesktopDropdownOpen((current) => !current)}
                        aria-expanded={desktopDropdownOpen}
                        aria-haspopup="menu"
                        className={`
                            inline-flex
                            h-11
                            items-center
                            gap-2
                            rounded-xl
                            px-4
                            text-sm
                            font-semibold
                            transition-colors

                            ${
                              isActive
                                ? `
                                  bg-blue-50
                                  text-blue-700
                                `
                                : `
                                  text-gray-600

                                  hover:bg-gray-50
                                  hover:text-gray-900
                                `
                            }
                          `}
                      >
                        {link.icon}

                        {link.name}

                        <FiChevronDown
                          className={`
                              text-sm
                              transition-transform
                              duration-200

                              ${desktopDropdownOpen ? "rotate-180" : ""}
                            `}
                        />
                      </button>

                      {/* =========================
                            DROPDOWN
                        ========================== */}

                      <div
                        role="menu"
                        className={`
                            absolute
                            left-1/2
                            top-full
                            mt-2
                            w-64
                            -translate-x-1/2
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            p-2
                            shadow-xl
                            shadow-gray-900/10
                            transition-all
                            duration-200

                            ${
                              desktopDropdownOpen
                                ? `
                                  visible
                                  translate-y-0
                                  opacity-100
                                `
                                : `
                                  invisible
                                  -translate-y-2
                                  opacity-0
                                `
                            }
                          `}
                      >
                        {FUNGSIONARIS_ITEMS.map((item) => {
                          const itemActive = pathname === item.path || (item.path !== "/pages/fungsionaris" && pathname.startsWith(`${item.path}/`));

                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              role="menuitem"
                              className={`
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-3
                                    py-2.5
                                    text-sm
                                    font-medium
                                    transition-colors

                                    ${
                                      itemActive
                                        ? `
                                          bg-blue-50
                                          text-blue-700
                                        `
                                        : `
                                          text-gray-600

                                          hover:bg-gray-50
                                          hover:text-gray-900
                                        `
                                    }
                                  `}
                            >
                              <span
                                className={`
                                      h-1.5
                                      w-1.5
                                      shrink-0
                                      rounded-full

                                      ${itemActive ? "bg-blue-600" : "bg-gray-300"}
                                    `}
                              />

                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // ===============================
                // NORMAL ITEM
                // ===============================

                return (
                  <Link
                    key={link.key}
                    href={link.path}
                    aria-current={isActive ? "page" : undefined}
                    className={`
                        inline-flex
                        h-11
                        items-center
                        gap-2
                        rounded-xl
                        px-4
                        text-sm
                        font-semibold
                        transition-colors

                        ${
                          isActive
                            ? `
                              bg-blue-50
                              text-blue-700
                            `
                            : `
                              text-gray-600

                              hover:bg-gray-50
                              hover:text-gray-900
                            `
                        }
                      `}
                  >
                    {link.icon}

                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* =====================================
                MOBILE BUTTON
            ====================================== */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                bg-white
                text-gray-600
                transition-colors

                hover:bg-gray-50
                hover:text-gray-900

                lg:hidden
              "
            >
              {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================
          MOBILE OVERLAY
      ========================================== */}

      <div
        className={`
          fixed
          inset-0
          z-40
          bg-gray-950/30
          backdrop-blur-[2px]
          transition-opacity
          duration-300

          lg:hidden

          ${
            mobileMenuOpen
              ? `
                pointer-events-auto
                opacity-100
              `
              : `
                pointer-events-none
                opacity-0
              `
          }
        `}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* =========================================
          MOBILE MENU
      ========================================== */}

      <div
        id="mobile-navigation"
        className={`
          fixed
          inset-x-0
          top-16
          z-50
          max-h-[calc(100dvh-4rem)]
          overflow-y-auto
          border-t
          border-gray-100
          bg-white
          shadow-xl
          transition-all
          duration-300

          lg:hidden

          ${
            mobileMenuOpen
              ? `
                visible
                translate-y-0
                opacity-100
              `
              : `
                invisible
                -translate-y-3
                opacity-0
              `
          }
        `}
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            py-4

            sm:px-6
          "
        >
          <nav aria-label="Navigasi mobile" className="space-y-1">
            {NAV_LINKS.map((link) => {
              const isActive = isRouteActive(link.path, link.key);

              // ===============================
              // MOBILE FUNGSIONARIS
              // ===============================

              if (link.key === "fungsionaris") {
                return (
                  <div key={link.key}>
                    <button
                      type="button"
                      onClick={() => setMobileDropdownOpen((current) => !current)}
                      aria-expanded={mobileDropdownOpen}
                      className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          transition-colors

                          ${
                            isActive
                              ? `
                                bg-blue-50
                                text-blue-700
                              `
                              : `
                                text-gray-700

                                hover:bg-gray-50
                              `
                          }
                        `}
                    >
                      <span
                        className="
                            flex
                            items-center
                            gap-3
                          "
                      >
                        {link.icon}

                        {link.name}
                      </span>

                      <FiChevronDown
                        className={`
                            transition-transform
                            duration-200

                            ${mobileDropdownOpen ? "rotate-180" : ""}
                          `}
                      />
                    </button>

                    <div
                      className={`
                          grid
                          transition-[grid-template-rows,opacity]
                          duration-300

                          ${
                            mobileDropdownOpen
                              ? `
                                grid-rows-[1fr]
                                opacity-100
                              `
                              : `
                                grid-rows-[0fr]
                                opacity-0
                              `
                          }
                        `}
                    >
                      <div className="overflow-hidden">
                        <div
                          className="
                              ml-5
                              mt-1
                              space-y-1
                              border-l
                              border-gray-200
                              pl-3
                            "
                        >
                          {FUNGSIONARIS_ITEMS.map((item) => {
                            const itemActive = pathname === item.path;

                            return (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={`
                                      block
                                      rounded-lg
                                      px-3
                                      py-2.5
                                      text-sm
                                      font-medium
                                      transition-colors

                                      ${
                                        itemActive
                                          ? `
                                            bg-blue-50
                                            text-blue-700
                                          `
                                          : `
                                            text-gray-600

                                            hover:bg-gray-50
                                            hover:text-gray-900
                                          `
                                      }
                                    `}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // ===============================
              // MOBILE NORMAL ITEM
              // ===============================

              return (
                <Link
                  key={link.key}
                  href={link.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-3
                      py-3
                      text-sm
                      font-semibold
                      transition-colors

                      ${
                        isActive
                          ? `
                            bg-blue-50
                            text-blue-700
                          `
                          : `
                            text-gray-700

                            hover:bg-gray-50
                          `
                      }
                    `}
                >
                  {link.icon}

                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
