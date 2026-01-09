"use client";

import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import { 
  CreditCard, 
  Calendar, 
  BookOpen,
  Home,
  Settings
} from "lucide-react";

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

export function DashboardLayout({ user, children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const previousPathname = useRef(pathname);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const tabs = [
    {
      name: "Przegląd",
      href: "/dashboard",
      icon: Home,
      description: "Ogólny przegląd i szybkie akcje"
    },
    {
      name: "Subskrypcje",
      href: "/dashboard/subscriptions",
      icon: CreditCard,
      description: "Zarządzaj swoimi subskrypcjami miejscowymi"
    },
    {
      name: "Moje zapisy",
      href: "/dashboard/registrations",
      icon: BookOpen,
      description: "Zobacz na jakie zajęcia jesteś zapisany"
    },
    {
      name: "Ustawienia",
      href: "/dashboard/settings",
      icon: Settings,
      description: "Zarządzaj ustawieniami konta"
    }
  ];

  // Helper function to determine if a tab is active
  const isTabActive = (tabHref: string) => {
    if (tabHref === "/dashboard") {
      return pathname === "/dashboard"; // Exact match for overview tab
    }
    return pathname.startsWith(tabHref); // Starts with for other tabs
  };

  // Get the currently active tab index
  const getActiveTabIndex = () => {
    return tabs.findIndex(tab => isTabActive(tab.href));
  };

  // Update active tab index when pathname changes
  useEffect(() => {
    setActiveTabIndex(getActiveTabIndex());
  }, [pathname]);

  // Focus management when route changes
  useEffect(() => {
    if (previousPathname.current !== pathname && mainContentRef.current) {
      // Focus the main content area after navigation
      mainContentRef.current.focus();
      previousPathname.current = pathname;
    }
  }, [pathname]);

  const handleTabClick = async (href: string, index: number) => {
    if (href === pathname) return; // Don't navigate if already on the tab
    
    setActiveTabIndex(index);
    
    try {
      // Navigate to the tab
      await router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
      setActiveTabIndex(getActiveTabIndex()); // Reset to current tab
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, href: string, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleTabClick(href, index);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (index + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      const nextTabElement = document.getElementById(`tab-${nextIndex}`);
      if (nextTabElement) {
        nextTabElement.focus();
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = index === 0 ? tabs.length - 1 : index - 1;
      const prevTab = tabs[prevIndex];
      const prevTabElement = document.getElementById(`tab-${prevIndex}`);
      if (prevTabElement) {
        prevTabElement.focus();
      }
    } else if (event.key === 'Home') {
      event.preventDefault();
      const firstTabElement = document.getElementById('tab-0');
      if (firstTabElement) {
        firstTabElement.focus();
      }
    } else if (event.key === 'End') {
      event.preventDefault();
      const lastTabElement = document.getElementById(`tab-${tabs.length - 1}`);
      if (lastTabElement) {
        lastTabElement.focus();
      }
    }
  };

  return (
    <div>
      {/* Skip Link for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-risu-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-risu-500 focus:ring-offset-2"
      >
        Przejdź do głównej treści
      </a>

      {/* Dashboard Tabs - Centered with Black Background and White Separators */}
      <div className="flex justify-center mb-8">
        <div className="bg-black rounded-xl p-2 shadow-lg border border-gray-800">
          <nav className="flex" aria-label="Dashboard navigation" role="tablist">
            {tabs.map((tab, index) => {
              const isActive = isTabActive(tab.href);
              const Icon = tab.icon;
              
              
              return (
                <div key={tab.name} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleTabClick(tab.href, index)}
                    onKeyDown={(e) => handleKeyDown(e, tab.href, index)}
                    className={`
                      group relative inline-flex items-center px-4 py-3 text-sm font-medium rounded-lg
                      transition-all duration-200 ease-in-out min-w-[120px] justify-center
                      ${isActive
                        ? 'bg-white text-black shadow-md'
                        : 'text-gray-300 hover:text-white'
                      }
                      cursor-pointer
                      
                    `}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${index}`}
                    id={`tab-${index}`}
                    tabIndex={isActive ? 0 : -1}
                    title={tab.description}
                    aria-label={`${tab.name}: ${tab.description}`}
                  >
                    
                    
                    {/* Icon */}
                    <Icon className={`mr-2 h-5 w-5 ${
                      isActive ? 'text-black' : 'text-gray-400 group-hover:text-white'
                    }`} aria-hidden="true" />
                    
                    {/* Tab name */}
                    <span className="font-medium">{tab.name}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full" />
                    )}
                  </button>
                  
                  {/* White separator between tabs (except after the last tab) */}
                  {index < tabs.length - 1 && (
                    <div className="w-px h-8 bg-white/20 mx-1" />
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      <div
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        role="tabpanel"
        aria-labelledby={`tab-${getActiveTabIndex()}`}
        className="focus:outline-none"
      >
        {children}
      </div>
    </div>
  );
}