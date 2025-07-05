"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Header } from "../components/Header";
import Footer from "../components/Footer";

import { Home, LayoutDashboard, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    isLoggedIn
      ? { label: "Profile", path: "/profile", icon: User }
      : {
          label: "Login",
          path: "#",
          icon: FcGoogle,
          isButton: true,
          onClick: () => setIsLoggedIn(true),
        },
  ].filter(Boolean);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        navItems={navItems}
        currentPath={pathname}
        onNavigate={handleNavigation}
      />

      <main className="flex-grow">{children}</main>

      <Footer />
    </div>
  );
};
