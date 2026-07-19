import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getApplicants, getAdmins } from '@/lib/db';
import { db } from '@/lib/firebase';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { HardDrive, UploadCloud, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

export default function Backup() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const lastBackup = localStorage.getItem('lastBackupDate');

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const applicants = await getApplicants();
      const backupData: any = { applicants };
      
      if (isSuperAdmin) {
        backupData.admins = await getAdmins();
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `RSSB_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const now = new Date().toLocaleString();
      localStorage.setItem('lastBackupDate', now);
      toast({ title: "Backup Created", description: "System backup downloaded successfully." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Backup Failed", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreClick = () => {
    if (!isSuperAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only Super Admins can restore backups." });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.applicants) throw new Error("Invalid backup file format.");

      const batch = writeBatch(db);
      let count = 0;

      // Restore applicants
      for (const app of data.applicants) {
        const { id, ...appData } = app;
        const ref = doc(collection(db, "applicants")); // Generate new IDs to prevent collisions
        batch.set(ref, appData);
        count++;
        // Firestore batch limit is 500
        if (count % 400 === 0) {
            await batch.commit();
        }
      }

      await batch.commit();

      toast({ title: "Restore Complete", description: `Successfully restored ${count} applicant records.` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Restore Failed", description: error.message });
    } finally {
      setRestoreLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">System Backup</h1>
        <p className="text-muted-foreground mt-1">Secure your data or restore from a previous state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HardDrive className="h-5 w-5" /> Create Backup</CardTitle>
            <CardDescription>Download a complete snapshot of the database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lastBackup && <p className="text-sm text-muted-foreground">Last backup performed: <strong>{lastBackup}</strong></p>}
            <Button className="w-full py-6 text-base" onClick={handleCreateBackup} disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating...</> : <><HardDrive className="mr-2 h-5 w-5" /> Download Backup File</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><UploadCloud className="h-5 w-5" /> Restore Backup</CardTitle>
            <CardDescription>Restore database from a previously downloaded JSON backup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex gap-3 text-sm items-start">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Warning: Restoring will append data to the current database. Duplicate records may occur. Super Admin access required.</p>
            </div>
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <Button 
              variant="destructive" 
              className="w-full py-6 text-base" 
              onClick={handleRestoreClick} 
              disabled={restoreLoading || !isSuperAdmin}
            >
              {restoreLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Restoring...</> : <><UploadCloud className="mr-2 h-5 w-5" /> Upload Backup File</>}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
