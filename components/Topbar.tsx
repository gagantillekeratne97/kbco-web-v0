"use client";

import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface TopbarProps {
  title?: string;
}

export function getUserInitials(username: string): string {
  if (!username) {
    return "";
  }

  return username.trim().substring(0, 2).toUpperCase();
}

export default function Topbar({ title }: TopbarProps) {
  const [displayName, setDisplayName] = useState<string>("");
  const [userCode, setUserCode] = useState<string>("");
  const [companyID, setCompanyID] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");

  useEffect(() => {
    // ---------------------------------------------------------
    // Check localStorage first, then sessionStorage
    // ---------------------------------------------------------

    const storedUserName =
      localStorage.getItem("userName") ||
      sessionStorage.getItem("userName");

    const storedUserCode =
      localStorage.getItem("userCode") ||
      sessionStorage.getItem("userCode");

    const storedCompanyID =
      localStorage.getItem("companyID") ||
      sessionStorage.getItem("companyID");
      
    const storedCompanyName = 
    localStorage.getItem("companyName") ||
    sessionStorage.getItem("companyName");

    if (storedUserName) {
      setDisplayName(storedUserName);
    }

    if (storedUserCode) {
      setUserCode(storedUserCode);
    }

    if (storedCompanyID) {
      setCompanyID(storedCompanyID);
    }

    if (storedCompanyName) {          
      setCompanyName(storedCompanyName);      
      console.log(companyName);
    }
  }, []);

  const initials = getUserInitials(displayName);

  return (
    <header className="sticky top-0 z-10 h-16 bg-card border-b border-border flex items-center gap-4 px-4 sm:px-6">      
      {/* Mobile menu toggle */}
      <button className="lg:hidden text-navy">
        <Menu size={22} />
      </button>

      {/* Page title */}
      <div className="hidden sm:block">
        <h1 className="text-lg font-semibold text-navy-text">
          {title}
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-2">        
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            placeholder="Search invoices, machines, customers..."
            className="w-full h-10 rounded-lg bg-surface border border-border pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange transition"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="ml-auto flex items-center gap-3">

        {/* Notification */}
        <button className="relative w-10 h-10 rounded-lg hover:bg-surface flex items-center justify-center text-navy-text transition-colors">
          <Bell size={19} />

          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange" />
        </button>

        <div className="w-px h-8 bg-border hidden sm:block" />

        {/* User */}
        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface transition-colors">

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-medium">
            {initials}
          </div>

          {/* User information */}
          <div className="hidden sm:block text-left">

            <p className="text-sm font-medium text-navy-text leading-tight">
              {displayName}
            </p>

            <div className="flex items-center gap-2 mt-0.5">

              <p className="text-xs text-navy-soft leading-tight">
                {userCode}
              </p>

              {/* Company */}
              {companyName && (
                <>
                  <span className="text-slate-300">•</span>

                  <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-orange/10 text-orange">
                    {companyName}
                  </span>
                </>
              )}

            </div>

          </div>

          <ChevronDown
            size={16}
            className="text-muted hidden sm:block"
          />

        </button>

      </div>
    </header>
  );
}
