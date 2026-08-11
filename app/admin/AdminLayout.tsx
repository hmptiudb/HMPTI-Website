"use client";

import Sidebar from "@/components/Sidebar";
import { auth } from "@/lib/firebase";

import { useRouter } from "next/navigation";

import { useEffect, useState, type ReactNode } from "react";

import { useAuthState } from "react-firebase-hooks/auth";

import { AiOutlineMenu } from "react-icons/ai";

import { ToastContainer } from "react-toastify";

// =========================================================
// TYPES
// =========================================================

interface AdminLayoutProps {
  children: ReactNode;
}

// =========================================================
// COMPONENT
// =========================================================

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [user, loading] = useAuthState(auth);

  const router = useRouter();

  // =======================================================
  // DESKTOP SIDEBAR
  // =======================================================

  const [collapsed, setCollapsed] = useState(false);

  // =======================================================
  // MOBILE SIDEBAR
  // =======================================================

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // =======================================================
  // LOAD COLLAPSED STATE
  // =======================================================

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem("hmpti-admin-sidebar-collapsed");

      if (savedState === "true") {
        setCollapsed(true);
      }

      if (savedState === "false") {
        setCollapsed(false);
      }
    } catch {
      /**
       * Abaikan jika localStorage
       * tidak tersedia.
       */
    }
  }, []);

  // =======================================================
  // SAVE COLLAPSED STATE
  // =======================================================

  useEffect(() => {
    try {
      window.localStorage.setItem("hmpti-admin-sidebar-collapsed", String(collapsed));
    } catch {
      /**
       * Abaikan jika localStorage
       * tidak tersedia.
       */
    }
  }, [collapsed]);

  // =======================================================
  // AUTH GUARD
  // =======================================================

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-gray-50
          px-4
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              h-10
              w-10
              animate-spin
              rounded-full
              border-2
              border-gray-200
              border-t-blue-600
            "
          />

          <p
            className="
              mt-4
              text-sm
              font-medium
              text-gray-500
            "
          >
            Memeriksa akses admin...
          </p>
        </div>
      </div>
    );
  }

  // =======================================================
  // NOT AUTHENTICATED
  // =======================================================

  if (!user) {
    return null;
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-gray-50
      "
    >
      {/* =========================================
          DESKTOP SIDEBAR
      ========================================== */}

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* =========================================
          MOBILE SIDEBAR
      ========================================== */}

      <Sidebar isMobile isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* =========================================
          PAGE WRAPPER
      ========================================== */}

      <div
        className={`
          min-h-screen
          w-full
          min-w-0
          bg-gray-50
          transition-[padding]
          duration-300
          ease-out

          ${collapsed ? "md:pl-16" : "md:pl-64"}
        `}
      >
        {/* =======================================
            MOBILE HEADER
        ======================================== */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            h-16
            items-center
            justify-between
            border-b
            border-gray-200
            bg-white/95
            px-4
            backdrop-blur

            md:hidden
          "
        >
          <div
            className="
              flex
              min-w-0
              items-center
              gap-3
            "
          >
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Buka menu admin"
              className="
                flex
                h-10
                w-10
                shrink-0
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
              "
            >
              <AiOutlineMenu className="text-xl" />
            </button>

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
          </div>

          {/* USER INITIAL */}

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
              text-xs
              font-bold
              text-white
            "
            title={user.email ?? "Administrator"}
          >
            {user.email?.charAt(0).toUpperCase() ?? "A"}
          </div>
        </header>

        {/* =======================================
            MAIN CONTENT
        ======================================== */}

        <main
          className="
            min-h-[calc(100vh-4rem)]
            w-full
            min-w-0
            overflow-x-hidden

            md:min-h-screen
          "
        >
          {children}
        </main>
      </div>

      {/* =========================================
          TOAST
      ========================================== */}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  );
}
