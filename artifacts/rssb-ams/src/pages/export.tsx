import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getApplicants, getAdmins } from '@/lib/db';
import { FileDown, DownloadCloud } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useToast } from '@/hooks/use-toast';

export default function Export() {
  const { isSuperAdmin } = useAuth();
  const { toast } = useToast();

  const handleExportApplicants = async (format: 'excel' | 'csv' | 'pdf') => {
    try {
      const data = await getApplicants();
      
      if (format === 'excel' || format === 'csv') {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Applicants");
        if (format === 'excel') XLSX.writeFile(wb, "RSSB_Applicants_Full.xlsx");
        if (format === 'csv') XLSX.writeFile(wb, "RSSB_Applicants_Full.csv");
      } else {
        const doc = new jsPDF('landscape');
        doc.text("RSSB Full Applicants Export", 14, 15);
        const tableData = data.map(a => [a.applicantName, a.phone, a.centreName, a.coupleOrSingle, a.gender, a.dateOfArrival]);
        (doc as any).autoTable({
          head: [["Name", "Phone", "Centre", "Type", "Gender", "Date"]],
          body: tableData,
          startY: 25,
        });
        doc.save("RSSB_Applicants_Full.pdf");
      }
      toast({ title: "Export Complete", description: `Data exported as ${format.toUpperCase()}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Failed", description: e.message });
    }
  };

  const handleExportAdmins = async () => {
    try {
      const data = await getAdmins();
      const ws = XLSX.utils.json_to_sheet(data.map(d => ({...d, createdDate: ''}))); // strip complex objects
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Admins");
      XLSX.writeFile(wb, "RSSB_Admins.xlsx");
      toast({ title: "Admin Export Complete" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Export Failed", description: e.message });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Data Export</h1>
        <p className="text-muted-foreground mt-1">Download raw system data for external analysis or archiving.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileDown className="h-5 w-5 text-primary" /> Applicants Data</CardTitle>
            <CardDescription>Export the entire applicants database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline" onClick={() => handleExportApplicants('excel')}>
              <DownloadCloud className="mr-2 h-4 w-4" /> Download as Excel (.xlsx)
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleExportApplicants('csv')}>
              <DownloadCloud className="mr-2 h-4 w-4" /> Download as CSV (.csv)
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => handleExportApplicants('pdf')}>
              <DownloadCloud className="mr-2 h-4 w-4" /> Download as PDF (.pdf)
            </Button>
          </CardContent>
        </Card>

        {isSuperAdmin && (
          <Card className="border-t-4 border-t-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileDown className="h-5 w-5 text-slate-800" /> Admin Users Data</CardTitle>
              <CardDescription>Super Admin Only: Export system users list.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full justify-start" variant="outline" onClick={handleExportAdmins}>
                <DownloadCloud className="mr-2 h-4 w-4" /> Download Admins Excel
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
