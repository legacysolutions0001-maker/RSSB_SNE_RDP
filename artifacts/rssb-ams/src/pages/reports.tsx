import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getApplicants } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select-simple';
import { formatDate, formatSimpleDate } from '@/lib/utils';
import { FileDown, Printer, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data: applicants, isLoading } = useQuery({
    queryKey: ['reportApplicants', genderFilter, typeFilter],
    queryFn: () => getApplicants({
      gender: genderFilter !== 'all' ? genderFilter : undefined,
      coupleOrSingle: typeFilter !== 'all' ? typeFilter : undefined,
    }),
  });

  const filteredData = applicants?.filter(a => {
    if (startDate && a.dateOfArrival < startDate) return false;
    if (endDate && a.dateOfArrival > endDate) return false;
    return true;
  }) || [];

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData.map(a => ({
      'Name': a.applicantName,
      'Age': a.age,
      'Gender': a.gender,
      'Phone': a.phone,
      'Centre Name': a.centreName,
      'Type': a.coupleOrSingle,
      'Handicap': a.handicap ? 'Yes' : 'No',
      'Arrival Date': a.dateOfArrival,
      'Arrival Time': a.timeOfArrival,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applicants Report");
    XLSX.writeFile(wb, `RSSB_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Radha Swami Satsang Beas - Applicants Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = ["Name", "Age", "Gender", "Phone", "Centre", "Type", "Arrival Date"];
    const tableRows = filteredData.map(a => [
      a.applicantName,
      a.age.toString(),
      a.gender,
      a.phone,
      a.centreName,
      a.coupleOrSingle,
      a.dateOfArrival
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [123, 28, 28] } // Maroon
    });

    doc.save(`RSSB_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-1">Generate and export applicant data.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={!filteredData.length}>
            <FileDown className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF} disabled={!filteredData.length}>
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          <Button onClick={() => window.print()} disabled={!filteredData.length}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <Card className="print:hidden border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <CardTitle className="text-lg">Filter Criteria</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Date From</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Date To</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Transgender">Transgender</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="Couple">Couple</option>
              <option value="Single">Single</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden">
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Total Records</p><p className="text-2xl font-bold">{filteredData.length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Couples</p><p className="text-2xl font-bold">{filteredData.filter(a=>a.coupleOrSingle==='Couple').length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Singles</p><p className="text-2xl font-bold">{filteredData.filter(a=>a.coupleOrSingle==='Single').length}</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-sm text-muted-foreground">Handicap</p><p className="text-2xl font-bold">{filteredData.filter(a=>a.handicap).length}</p></CardContent></Card>
      </div>

      <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-serif font-bold">Radha Swami Satsang Beas</h1>
        <p className="text-lg">Accommodation Report</p>
        <p className="text-sm mt-1">Generated: {new Date().toLocaleDateString()}</p>
        <p className="text-sm font-bold mt-2">Total Records: {filteredData.length}</p>
      </div>

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table className="print:text-xs">
              <TableHeader>
                <TableRow className="print:border-black print:bg-gray-200">
                  <TableHead className="print:text-black font-bold">Name</TableHead>
                  <TableHead className="print:text-black font-bold">Age/Gender</TableHead>
                  <TableHead className="print:text-black font-bold">Centre</TableHead>
                  <TableHead className="print:text-black font-bold">Type</TableHead>
                  <TableHead className="print:text-black font-bold">Arrival</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map(a => (
                  <TableRow key={a.id} className="print:border-b print:border-gray-300">
                    <TableCell className="font-medium">{a.applicantName}</TableCell>
                    <TableCell>{a.age} / {a.gender}</TableCell>
                    <TableCell>{a.centreName}</TableCell>
                    <TableCell>{a.coupleOrSingle}</TableCell>
                    <TableCell>{formatSimpleDate(a.dateOfArrival)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
