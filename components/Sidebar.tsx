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
  Folder,
  Loader2,
  Truck
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [  
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Testing", icon: Folder, href: "/testing-page" }, 
  { label: "Invoices", icon: FileText, href: "/invoices" },  
  { label: "Pending Invoices", icon: Receipt, href: "/pending-invoice-report" },  
  { label: "Cancelled Invoices", icon: FileText, href: "/cancelled-invoice" },
  { label: "Credit Notes", icon: Receipt, href: "/credit-notes" },
  { label: "Revenue Report", icon: Router, href: "/invoice-revenue-report" },
  { label: "Machine Return Report", icon: Router, href: "/machine-return" },
  { label: "Internal Consumptions", icon: FileText, href: "/internal-consumption" },
  { label: "Machines", icon: Cpu, href: "/machines" },    
  { label: "Customers", icon: Users, href: "/coming-soon-page" },
  { label: "Machine Movements", icon: Truck, href: "/machinemovent", 
    children: [
      {label: "Machine Return", href: "/machine-movement/machine-return" }, 
      {label: "Machine Disposal", href: "/machine-movement/machine-disposal" }
    ]
  }, 
  { label: "Invoice Processing", icon: Receipt, href: "/transactions",     
    children: [
        { label: "B/W Invoices", href: "/transactions/bwinvoice-page"},        
        { label: "Color Invoices", href: "/transactions/color-invoice-page"}, 
        { label: "Invoice Viewer", href: "/transactions/invoice-viewer"},         
    ]
  }, 
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
      { label: "Credit Notes", href: "/transactions/creditnote" },
      { label: "Partly Credit Notes", href: "/transactions/partlyCreditNote"}
    ],
  },
  { label: "Settings", icon: Settings, href: "/coming-soon-page" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // The link that was just clicked and is still loading its page
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const pathname = usePathname();  
  const router = useRouter();

  // The new page has arrived, so stop showing the spinner
  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

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
      <div className="flex items-center h-16 gap-3 px-5 border-b border-white/10">
        <div className="flex items-center justify-center font-bold rounded-lg w-9 h-9 bg-orange text-navy shrink-0 font-display">
          GD
        </div>
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight font-display">
            KBCO WEB v.2
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
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
                  <div className="pl-3 mt-1 ml-8 space-y-1 border-l border-white/10">
                    {children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() =>
                            child.href !== pathname && setPendingHref(child.href)
                          }
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            isChildActive
                              ? "bg-orange text-navy font-medium"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {child.label}
                          {pendingHref === child.href && (
                            <Loader2 size={14} className="animate-spin" />
                          )}
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
              onClick={() => href !== pathname && setPendingHref(href)}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-orange text-navy font-medium"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
              {!collapsed && pendingHref === href && (
                <Loader2 size={14} className="ml-auto animate-spin" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 space-y-1 border-t border-white/10">
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