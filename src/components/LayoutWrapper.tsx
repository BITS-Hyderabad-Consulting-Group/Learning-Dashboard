"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

import { Header } from "../components/Header";
import Footer from "../components/Footer";

import { Home, LayoutDashboard, User as UserIcon, LogOut } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        alert('Error signing in with Google. Please try again.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
        alert('Error signing out. Please try again.');
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred. Please try again.');
    }
  };

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    user ? { label: "Profile", path: "/profile", icon: UserIcon } : null,
    user ? {
      label: "Logout",
      path: "#",
      icon: LogOut,
      isButton: true,
      onClick: handleSignOut,
    } : {
      label: "Login",
      path: "#",
      icon: FcGoogle,
      isButton: true,
      onClick: handleGoogleSignIn,
    },
  ].filter(Boolean);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
