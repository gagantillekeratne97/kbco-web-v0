"use client";

import { Search, Bell, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";

interface TopbarProps { 
  title?: string;   
}

export default function Topbar({ title }: TopbarProps) {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => { 
    setDisplayName(sessionStorage.getItem("username"));
  }, []);

  return (
    <header className="sticky top-0 z-10 h-16 bg-card border-b border-border flex items-center gap-4 px-4 sm:px-6">
      {/* Mobile menu toggle (wire this up to a drawer version of Sidebar) */}
      <button className="lg:hidden text-navy">
        <Menu size={22} />
      </button>

      {/* Page title — swap per-route if using nested layouts */}
      <div className="hidden sm:block">
        <h1 className="text-lg font-semibold text-navy-text">{title}</h1>
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
        <button className="relative w-10 h-10 rounded-lg hover:bg-surface flex items-center justify-center text-navy-text transition-colors">
          <Bell size={19} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange" />
        </button>

        <div className="w-px h-8 bg-border hidden sm:block" />

        <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-surface transition-colors">
          <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center text-xs font-medium">
            AS
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-navy-text leading-tight">
              {displayName}
            </p>
            <p className="text-xs text-navy-soft leading-tight">Admin</p>
          </div>
          <ChevronDown size={16} className="text-muted hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
