import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import rssbLogo from '@assets/image_1784436419049.png';
import { MapPin, Phone, Building2 } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500 pt-8">
      <Card className="border-none shadow-lg overflow-hidden relative">
        <div className="h-32 bg-primary"></div>
        <CardContent className="px-8 pb-8 pt-0 relative">
          <div className="mx-auto w-32 h-32 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center -mt-16 mb-6 p-4">
            <img src={rssbLogo} alt="RSSB Logo" className="w-full h-full object-contain" />
          </div>
          
          <div className="text-center space-y-2 mb-10">
            <h1 className="text-3xl font-serif font-bold text-slate-900">Radha Swami Satsang Beas</h1>
            <h2 className="text-xl text-primary font-medium">Dera Baba Jaimal Singh</h2>
            <div className="inline-block px-4 py-1.5 bg-muted rounded-full text-sm font-semibold text-slate-700 mt-2 border">
              SNE Old Enclosure Accommodation
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left border-t pt-8">
            <div className="space-y-4 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><MapPin className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Location</div>
                  <div className="font-medium text-lg">Rudrapur, Uttarakhand</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="p-2 bg-primary/10 rounded-full text-primary"><Phone className="h-5 w-5" /></div>
                <div>
                  <div className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Helpline</div>
                  <div className="font-medium text-lg">+91 8923940501</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center border-t pt-6 text-sm text-muted-foreground">
            <p>RSSB SNE Accommodation Management System</p>
            <p className="mt-1">Version 1.0.0</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
