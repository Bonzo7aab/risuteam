"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { LogIn, User, CreditCard, Settings, ChevronDown } from "lucide-react";
import { signOutAction } from "@/app/actions";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface MobileAuthButtonsProps {
  onClose?: () => void;
}

export const MobileAuthButtons = ({ onClose }: MobileAuthButtonsProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="text-gray-700 text-sm">Ładowanie...</div>;
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-full py-3 text-base border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors font-medium tracking-widest uppercase flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            <span>Konto</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-56">
          <div className="px-2 py-1.5 text-sm text-slate-600 border-b border-slate-200">
            <p className="font-medium">{user.email}</p>
            <p className="text-xs text-slate-500">
              {user.app_metadata?.role === "admin" ? "Administrator" : "Użytkownik"}
            </p>
          </div>
          <DropdownMenuSeparator />
          {user.app_metadata?.role === "admin" ? (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex items-center gap-2 cursor-pointer py-3" onClick={onClose}>
                <User className="w-4 h-4" />
                Panel Admina
              </Link>
            </DropdownMenuItem>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer py-3" onClick={onClose}>
                  <User className="w-4 h-4" />
                  Panel
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/subscriptions" className="flex items-center gap-2 cursor-pointer py-3" onClick={onClose}>
                  <CreditCard className="w-4 h-4" />
                  Subskrypcje
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer py-3" onClick={onClose}>
                  <Settings className="w-4 h-4" />
                  Ustawienia
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <form action={signOutAction} className="w-full">
              <Button 
                type="submit" 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start h-auto p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Wyloguj
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show auth links only when user is not authenticated
  return (
    <div className="flex flex-col items-center w-full gap-2">
      <Link
        href="/sign-in"
        onClick={onClose}
        className="w-full py-3 text-center text-base border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-sm font-medium tracking-widest transition-colors flex items-center justify-center gap-2 uppercase"
        style={{ letterSpacing: "0.1em" }}
      >
        <LogIn className="w-5 h-5" />
        Zaloguj
      </Link>
      <Link
        href="/sign-up"
        onClick={onClose}
        className="w-full py-3 text-center text-base bg-risu-400 hover:bg-risu-600 rounded-sm font-medium tracking-widest text-gray-700 transition-colors flex items-center justify-center gap-2 uppercase"
        style={{ letterSpacing: "0.1em" }}
      >
        Rejestracja
      </Link>
    </div>
  );
};
