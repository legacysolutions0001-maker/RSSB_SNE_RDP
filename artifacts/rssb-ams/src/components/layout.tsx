import * as React from "react"
import { LayoutDashboard, Users, UserPlus, FileText, Download, Database, ShieldAlert, Settings, Info, LogOut, Loader2 } from "lucide-react"
import { Link, useLocation } from "wouter"
import { useAuth } from "@/context/AuthContext"
import { logout } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import rssbLogo from '@assets/image_1784436419049.png'

export function Layout({ children, title }: { children: React.ReactNode, title?: string }) {
  const [location] = useLocation();
  const { user, profile, loading, isSuperAdmin } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out successfully" });
    } catch (e: any) {
      toast({ title: "Logout failed", description: e.message, variant: "destructive" });
    }
  };

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/applicants", label: "Applicants", icon: Users },
    { href: "/applicants/add", label: "Add Applicant", icon: UserPlus },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/export", label: "Export", icon: Download },
    { href: "/backup", label: "Backup & Restore", icon: Database },
  ];

  if (isSuperAdmin) {
    menuItems.push({ href: "/admins", label: "Admins", icon: ShieldAlert });
  }

  const bottomItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/about", label: "About", icon: Info },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          <div className="h-[60px] flex items-center px-6 border-b border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
            <span className="font-serif font-bold text-lg truncate">RSSB SNE</span>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href) && item.href !== "/applicants");
              const isExactApplicants = item.href === "/applicants" && (location === "/applicants" || location.match(/^\/applicants\/[a-zA-Z0-9_-]+$/) && !location.includes("/add"));

              const active = isActive || isExactApplicants;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active 
                      ? "bg-sidebar-primary/10 text-sidebar-primary" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          {bottomItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location === item.href 
                  ? "bg-sidebar-primary/10 text-sidebar-primary" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-[60px] bg-primary text-primary-foreground flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 truncate">
            <img src={rssbLogo} alt="RSSB Logo" className="h-[40px] w-auto bg-white rounded-full p-0.5 object-contain" />
            <div className="flex flex-col hidden sm:flex">
              <span className="font-serif font-bold text-sm leading-tight tracking-wide">Radha Swami Satsang Beas</span>
              <span className="text-xs opacity-90 leading-tight">SNE Old Enclosure Accommodation — Rudrapur, UK</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium hidden md:inline-flex opacity-90">
              Helpline: +91 8923940501
            </span>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
                {profile?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="text-sm font-medium hidden sm:inline-flex">
                {profile?.fullName || user?.email}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {title && (
              <div>
                <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">{title}</h1>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
