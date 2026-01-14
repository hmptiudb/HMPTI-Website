"use client";

import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineCalendar, AiOutlineClose, AiOutlineDashboard, AiOutlineFileText, AiOutlineLogout, AiOutlineMenu, AiOutlineShop, AiOutlineTeam } from "react-icons/ai";

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export default function AdminSidebar({ isOpen = false, onClose, isMobile = false, collapsed, setCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/auth/login");
  };

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <AiOutlineDashboard className="text-xl" />,
    },
    {
      href: "/admin/member",
      label: "Anggota",
      icon: <AiOutlineTeam className="text-xl" />,
    },
    {
      href: "/admin/event",
      label: "Event",
      icon: <AiOutlineCalendar className="text-xl" />,
    },
    {
      href: "/admin/news",
      label: "Berita",
      icon: <AiOutlineFileText className="text-xl" />,
    },
    {
      href: "/admin/product",
      label: "Produk",
      icon: <AiOutlineShop className="text-xl" />,
    },
  ];

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    if (isMobile && isOpen && onClose) {
      onClose();
    }
  }, [pathname, isMobile, isOpen, onClose]);

  const sidebarContent = (
    <>
      {/* Header with Logo */}
      <div
        className={`
    flex items-center h-16 border-b border-gray-200
    transition-all duration-300
    ${collapsed ? "justify-center px-2" : "justify-between px-4"}
  `}
      >
        {/* Logo + Title */}
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-800 whitespace-nowrap">HMPTI Admin</h1>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
        )}

        {/* Toggle Button (Desktop) */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <AiOutlineMenu className="text-gray-600 text-lg" /> : <AiOutlineClose className="text-gray-600 text-lg" />}
          </button>
        )}

        {/* Close Button (Mobile) */}
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <AiOutlineClose className="text-gray-600 text-lg" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
            relative flex items-center rounded-lg px-3 py-3
            transition-all duration-200 group
            ${isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
            ${collapsed ? "justify-center" : ""}
          `}
              >
                {/* Icon */}
                <div className={`relative ${collapsed ? "" : "mr-3"}`}>
                  {item.icon}

                  {/* Active indicator */}
                  {isActive && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-full" />}
                </div>

                {/* Label (desktop expand) */}
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}

                {/* Tooltip (collapsed) */}
                {collapsed && (
                  <span
                    className="
                absolute left-full ml-2 px-2 py-1
                bg-gray-900 text-white text-xs rounded
                opacity-0 group-hover:opacity-100
                transition-opacity pointer-events-none
                whitespace-nowrap z-50
              "
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`
            relative flex items-center w-full rounded-lg px-3 py-3
            text-gray-600 hover:bg-gray-50 hover:text-gray-900
            transition-all duration-200 group
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {/* Icon */}
          <AiOutlineLogout className={`text-xl ${collapsed ? "" : "mr-3"}`} />

          {/* Label (expanded) */}
          {!collapsed && <span className="text-sm font-medium">Logout</span>}

          {/* Tooltip (collapsed) */}
          {collapsed && (
            <span
              className="
                absolute left-full ml-2 px-2 py-1
                bg-gray-900 text-white text-xs rounded
                opacity-0 group-hover:opacity-100
                transition-opacity pointer-events-none
                whitespace-nowrap z-50
              "
            >
              Logout
            </span>
          )}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
        <div
          className="relative flex flex-col w-80 bg-white h-full shadow-xl border-r border-gray-200 transform transition-transform duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`hidden md:flex flex-col fixed inset-y-0 bg-white border-r border-gray-200 transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {sidebarContent}

      {/* Collapse Handle */}
      {!collapsed && isHovered && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setCollapsed(true)}
            className="w-4 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </button>
        </div>
      )}

      {collapsed && isHovered && (
        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-4 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </button>
        </div>
      )}
    </div>
  );
}
