"use client";

import {
  LayoutDashboard,
  FileText,
  Receipt,
  Cpu,
  Settings,
  LogOut,
  Boxes,
  Users,
  ChevronsLeft,
  ChevronDown,
  Router,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [  
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Invoices", icon: FileText, href: "/invoices" },
  { label: "Cancelled Invoices", icon: FileText, href: "/cancelled-invoice" },
  { label: "Credit Notes", icon: Receipt, href: "/credit-notes" },
  { label: "Revenue Report", icon: Router, href: "/invoice-revenue-report" },
  { label: "Machines", icon: Cpu, href: "/coming-soon-page" },    
  { label: "Customers", icon: Users, href: "/coming-soon-page" },
  { label: "Spare Parts", icon: Boxes, href: "/spare-parts", 
    children: [ 
      { label: "Upload Items", href: "/spare-parts/upload-items"},
      { label: "Items Report", href: "/spare-parts/items-report"}
    ],
  },
    {
    label: "Transactions",
    icon: Settings,
    href: "/transactions",
    children: [
      { label: "New Installations", href: "/coming-soon-page" },
      { label: "Invoices", href: "/coming-soon-page" },
      { label: "Credit Notes", href: "/coming-soon-page" },
    ],
  },
  { label: "Settings", icon: Settings, href: "/coming-soon-page" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();  
  const router = useRouter();

  const handleLogout = () => { 
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 bg-navy text-white shrink-0 transition-all duration-200 font-display",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center font-bold text-navy shrink-0 font-display">
          GD
        </div>
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight font-display">
            KBCO WEB v.2
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, href, children }) => {
          const hasChildren = !!children?.length;
          const isParentActive =
            pathname === href || children?.some((c) => pathname === c.href);
          const isOpen = openMenu === label || (hasChildren && isParentActive);

          if (hasChildren) {
            return (
              <div key={label}>
                <button
                  type="button"
                  onClick={() => {
                    if (collapsed) {
                      setCollapsed(false);
                      setOpenMenu(label);
                      return;
                    }
                    setOpenMenu((prev) => (prev === label ? null : label));
                  }}
                  aria-expanded={isOpen}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isParentActive
                      ? "bg-orange text-navy font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{label}</span>
                      <ChevronDown
                        size={16}
                        className={cn(
                          "shrink-0 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </>
                  )}
                </button>

                {!collapsed && isOpen && (
                  <div className="mt-1 ml-8 space-y-1 border-l border-white/10 pl-3">
                    {children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm transition-colors",
                            isChildActive
                              ? "bg-orange text-navy font-medium"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-orange text-navy font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 p-3 space-y-1">
        <button
          onClick={handleLogout}
         className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ChevronsLeft
            size={18}
            className={cn("shrink-0 transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}