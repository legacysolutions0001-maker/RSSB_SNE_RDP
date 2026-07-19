import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileText,
  Download,
  HardDrive,
  ShieldAlert,
  Settings,
  Info,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { logout } from '@/lib/auth';

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', roles: ['admin', 'super_admin'] },
  { icon: Users, label: 'Applicants', href: '/applicants', roles: ['admin', 'super_admin'] },
  { icon: UserPlus, label: 'Add Applicant', href: '/applicants/add', roles: ['admin', 'super_admin'] },
  { icon: FileText, label: 'Reports', href: '/reports', roles: ['admin', 'super_admin'] },
  { icon: Download, label: 'Export', href: '/export', roles: ['admin', 'super_admin'] },
  { icon: HardDrive, label: 'Backup', href: '/backup', roles: ['admin', 'super_admin'] },
  { icon: ShieldAlert, label: 'Admins', href: '/admins', roles: ['super_admin'] },
  { icon: Settings, label: 'Settings', href: '/settings', roles: ['admin', 'super_admin'] },
  { icon: Info, label: 'About', href: '/about', roles: ['admin', 'super_admin'] },
];

export function Sidebar() {
  const [location] = useLocation();
  const { profile } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="w-56 h-[calc(100vh-64px)] fixed left-0 top-[64px] border-r bg-card flex flex-col justify-between shadow-sm z-10">
      <div className="py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => {
          if (profile && !item.roles.includes(profile.role)) return null;
          
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href) && item.href !== '/applicants');
          const isApplicantsListActive = item.href === '/applicants' && location === '/applicants';

          const active = item.href === '/applicants' ? isApplicantsListActive : isActive;

          return (
            <Link key={item.href} href={item.href} className="w-full focus:outline-none">
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
          data-testid="nav-logout"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
