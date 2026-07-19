import React from 'react';
import rssbLogo from '@assets/image_1784436419049.png';
import { useAuth } from '@/context/AuthContext';
import { User, Phone } from 'lucide-react';

export function Header() {
  const { profile } = useAuth();

  return (
    <header className="h-16 w-full fixed top-0 left-0 bg-primary text-primary-foreground shadow-md z-20 flex items-center justify-between px-6 border-b border-primary-foreground/10">
      <div className="flex items-center gap-4">
        <div className="bg-white p-1 rounded-sm shadow-sm">
          <img src={rssbLogo} alt="RSSB Logo" className="h-8 w-auto object-contain" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-serif font-bold leading-tight">Radha Swami Satsang Beas</h1>
          <span className="text-xs text-primary-foreground/80 font-medium tracking-wide">
            SNE Old Enclosure Accommodation | Rudrapur, Uttarakhand
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 text-sm text-primary-foreground/90 bg-black/10 px-3 py-1.5 rounded-full">
          <Phone className="h-3.5 w-3.5" />
          <span className="font-medium">+91 8923940501</span>
        </div>
        <div className="flex items-center gap-2 border-l border-primary-foreground/20 pl-6">
          <div className="h-8 w-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center shadow-inner">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">{profile?.fullName || 'User'}</span>
            <span className="text-xs text-primary-foreground/80 capitalize">{profile?.role.replace('_', ' ')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
