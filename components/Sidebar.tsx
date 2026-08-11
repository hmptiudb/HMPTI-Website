"use client";

import { auth } from "@/lib/firebase";

import { signOut } from "firebase/auth";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import { useEffect, useState } from "react";

import type { IconType } from "react-icons";

import {
  AiOutlineCalendar,
  AiOutlineClose,
  AiOutlineDashboard,
  AiOutlineFileText,
  AiOutlineLoading3Quarters,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineShop,
  AiOutlineTeam,
} from "react-icons/ai";

import { toast } from "react-toastify";

// =========================================================
// TYPES
// =========================================================

interface AdminSidebarProps {
  isOpen?: boolean;

  onClose?: () => void;

  isMobile?: boolean;

  collapsed: boolean;

  setCollapsed: (value: boolean) => void;
}

interface MenuItem {
  href: string;

  label: string;

  icon: IconType;
}

// =========================================================
// MENU
// =========================================================

const MENU_ITEMS: MenuItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: AiOutlineDashboard,
  },
  {
    href: "/admin/member",
    label: "Anggota",
    icon: AiOutlineTeam,
  },
  {
    href: "/admin/event",
    label: "Event",
    icon: AiOutlineCalendar,
  },
  {
    href: "/admin/news",
    label: "Berita",
    icon: AiOutlineFileText,
  },
  {
    href: "/admin/product",
    label: "Produk",
    icon: AiOutlineShop,
  },
];

// =========================================================
// COMPONENT
// =========================================================

export default function AdminSidebar({ isOpen = false, onClose, isMobile = false, collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();

  const router = useRouter();

  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Sidebar mobile harus selalu
   * menggunakan mode expanded.
   *
   * State collapsed hanya berlaku
   * untuk sidebar desktop.
   */
  const isCollapsed = isMobile ? false : collapsed;

  // =======================================================
  // ACTIVE ROUTE
  // =======================================================

  const isActiveRoute = (href: string) => {
    /**
     * Dashboard hanya aktif pada
     * /admin/dashboard.
     */
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    /**
     * Menu lainnya tetap aktif
     * jika nanti memiliki subroute.
     *
     * Contoh:
     * /admin/event/123
     */
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // =======================================================
  // MOBILE BODY LOCK + ESC
  // =======================================================

  useEffect(() => {
    if (!isMobile || !isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, isOpen, onClose]);

  // =======================================================
  // MENU CLICK
  // =======================================================

  const handleMenuClick = () => {
    /**
     * Mobile sidebar ditutup ketika
     * pengguna memilih menu.
     *
     * Ini menggantikan useEffect
     * pathname lama yang bisa membuat
     * sidebar langsung tertutup
     * ketika baru dibuka.
     */
    if (isMobile) {
      onClose?.();
    }
  };

  // =======================================================
  // COLLAPSE
  // =======================================================

  const handleToggleCollapse = () => {
    if (isMobile) {
      return;
    }

    setCollapsed(!collapsed);
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const handleLogout = async () => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      await signOut(auth);

      onClose?.();

      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);

      toast.error("Gagal keluar dari akun. Silakan coba kembali.");

      setLogoutLoading(false);
    }
  };

  // =======================================================
  // SIDEBAR CONTENT
  // =======================================================

  const sidebarContent = (
    <>
      {/* =========================================
          HEADER
      ========================================== */}

      <div
        className={`
          flex
          h-16
          shrink-0
          items-center
          border-b
          border-gray-100
          transition-all
          duration-300

          ${
            isCollapsed
              ? `
                justify-center
                px-2
              `
              : `
                justify-between
                px-4
              `
          }
        `}
      >
        {/* =======================================
            BRAND
        ======================================== */}

        <Link
          href="/admin/dashboard"
          onClick={handleMenuClick}
          aria-label="HMPTI Admin Dashboard"
          className={`
            flex
            min-w-0
            items-center
            gap-3

            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-sm
              font-bold
              text-white
              shadow-sm
              shadow-blue-500/20
            "
          >
            H
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-sm
                  font-bold
                  text-gray-900
                "
              >
                HMPTI Admin
              </p>

              <p
                className="
                  truncate
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-gray-400
                "
              >
                Management
              </p>
            </div>
          )}
        </Link>

        {/* =======================================
            DESKTOP TOGGLE
        ======================================== */}

        {!isMobile && !isCollapsed && (
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Tutup sidebar"
            title="Kecilkan sidebar"
            className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition-colors

                hover:bg-gray-100
                hover:text-gray-700
              "
          >
            <AiOutlineClose className="text-lg" />
          </button>
        )}

        {/* =======================================
            MOBILE CLOSE
        ======================================== */}

        {isMobile && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition-colors

              hover:bg-gray-100
              hover:text-gray-700
            "
          >
            <AiOutlineClose className="text-xl" />
          </button>
        )}
      </div>

      {/* =========================================
          COLLAPSED OPEN BUTTON
      ========================================== */}

      {!isMobile && isCollapsed && (
        <div
          className="
              flex
              justify-center
              px-2
              pt-3
            "
        >
          <button
            type="button"
            onClick={handleToggleCollapse}
            aria-label="Buka sidebar"
            title="Perbesar sidebar"
            className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-gray-400
                transition-colors

                hover:bg-gray-100
                hover:text-gray-700
              "
          >
            <AiOutlineMenu className="text-lg" />
          </button>
        </div>
      )}

      {/* =========================================
          NAVIGATION
      ========================================== */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-2
          py-4
        "
      >
        {!isCollapsed && (
          <p
            className="
              mb-2
              px-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-gray-400
            "
          >
            Menu Utama
          </p>
        )}

        <nav aria-label="Navigasi admin" className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;

            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleMenuClick}
                aria-current={isActive ? "page" : undefined}
                aria-label={isCollapsed ? item.label : undefined}
                title={isCollapsed ? item.label : undefined}
                className={`
                    group
                    relative
                    flex
                    min-h-11
                    items-center
                    rounded-xl
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${isCollapsed ? "justify-center" : ""}

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
                {/* =================================
                      ACTIVE INDICATOR
                  ================================== */}

                {isActive && (
                  <span
                    aria-hidden="true"
                    className="
                        absolute
                        left-0
                        top-1/2
                        h-6
                        w-1
                        -translate-y-1/2
                        rounded-r-full
                        bg-blue-600
                      "
                  />
                )}

                {/* =================================
                      ICON
                  ================================== */}

                <Icon
                  className={`
                      shrink-0
                      text-xl
                      transition-colors

                      ${
                        isActive
                          ? "text-blue-600"
                          : `
                            text-gray-400

                            group-hover:text-gray-600
                          `
                      }

                      ${!isCollapsed ? "mr-3" : ""}
                    `}
                />

                {/* =================================
                      LABEL
                  ================================== */}

                {!isCollapsed && (
                  <span
                    className="
                        min-w-0
                        flex-1
                        truncate
                      "
                  >
                    {item.label}
                  </span>
                )}

                {/* =================================
                      ACTIVE DOT
                  ================================== */}

                {isActive && !isCollapsed && (
                  <span
                    aria-hidden="true"
                    className="
                          h-1.5
                          w-1.5
                          shrink-0
                          rounded-full
                          bg-blue-600
                        "
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* =========================================
          FOOTER
      ========================================== */}

      <div
        className="
          shrink-0
          border-t
          border-gray-100
          p-2
        "
      >
        {!isCollapsed && (
          <div
            className="
              mb-2
              rounded-xl
              bg-gray-50
              px-3
              py-2.5
            "
          >
            <p
              className="
                truncate
                text-[11px]
                font-medium
                text-gray-500
              "
            >
              {auth.currentUser?.email ?? "Administrator"}
            </p>

            <p
              className="
                mt-0.5
                text-[10px]
                text-gray-400
              "
            >
              Administrator
            </p>
          </div>
        )}

        {/* =======================================
            LOGOUT
        ======================================== */}

        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutLoading}
          aria-label={isCollapsed ? "Keluar" : undefined}
          title={isCollapsed ? "Keluar" : undefined}
          className={`
            group
            flex
            min-h-11
            w-full
            items-center
            rounded-xl
            px-3
            text-sm
            font-medium
            text-gray-600
            transition-colors

            hover:bg-red-50
            hover:text-red-600

            disabled:cursor-not-allowed
            disabled:opacity-50

            ${isCollapsed ? "justify-center" : ""}
          `}
        >
          {logoutLoading ? (
            <AiOutlineLoading3Quarters
              className={`
                shrink-0
                animate-spin
                text-xl

                ${!isCollapsed ? "mr-3" : ""}
              `}
            />
          ) : (
            <AiOutlineLogout
              className={`
                shrink-0
                text-xl
                text-gray-400
                transition-colors

                group-hover:text-red-500

                ${!isCollapsed ? "mr-3" : ""}
              `}
            />
          )}

          {!isCollapsed && <span>{logoutLoading ? "Keluar..." : "Logout"}</span>}
        </button>
      </div>
    </>
  );

  // =======================================================
  // MOBILE SIDEBAR
  // =======================================================

  if (isMobile) {
    return (
      <div
        className={`
          fixed
          inset-0
          z-[70]

          md:hidden

          ${isOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
        aria-hidden={!isOpen}
      >
        {/* =======================================
            BACKDROP
        ======================================== */}

        <button
          type="button"
          aria-label="Tutup menu sidebar"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className={`
            absolute
            inset-0
            bg-black/40
            backdrop-blur-[2px]
            transition-opacity
            duration-300

            ${isOpen ? "opacity-100" : "opacity-0"}
          `}
        />

        {/* =======================================
            DRAWER
        ======================================== */}

        <aside
          className={`
            relative
            z-10
            flex
            h-full
            w-[min(320px,88vw)]
            flex-col
            border-r
            border-gray-200
            bg-white
            shadow-2xl
            transition-transform
            duration-300
            ease-out

            ${isOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {sidebarContent}
        </aside>
      </div>
    );
  }

  // =======================================================
  // DESKTOP SIDEBAR
  // =======================================================

  return (
    <aside
      className={`
        fixed
        inset-y-0
        left-0
        z-40
        hidden
        flex-col
        border-r
        border-gray-200
        bg-white
        shadow-[2px_0_8px_rgba(15,23,42,0.02)]
        transition-[width]
        duration-300
        ease-out

        md:flex

        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {sidebarContent}
    </aside>
  );
}
