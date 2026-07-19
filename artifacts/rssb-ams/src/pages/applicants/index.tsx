import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplicants, deleteApplicant } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Search, Filter, Eye, Trash2, Edit, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate, formatSimpleDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select } from '@/components/ui/select-simple';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Applicants() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [handicapFilter, setHandicapFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: applicants, isLoading } = useQuery({
    queryKey: ['applicants', search, genderFilter, typeFilter, handicapFilter],
    queryFn: () => getApplicants({
      search: search || undefined,
      gender: genderFilter !== 'all' ? genderFilter : undefined,
      coupleOrSingle: typeFilter !== 'all' ? typeFilter : undefined,
      handicap: handicapFilter !== 'all' ? handicapFilter === 'true' : undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast({
        title: "Record Deleted",
        description: "The applicant record has been removed.",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete record.",
      });
      setDeleteId(null);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Applicants Register</h1>
          <p className="text-muted-foreground mt-1">Manage and search all accommodation records.</p>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/applicants/add">Add New Applicant</Link>
        </Button>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader className="bg-muted/30 border-b pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or centre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            
            <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
              <Select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)} className="w-[140px] bg-white">
                <option value="all">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Transgender">Transgender</option>
              </Select>

              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-[140px] bg-white">
                <option value="all">All Types</option>
                <option value="Couple">Couple</option>
                <option value="Single">Single</option>
              </Select>

              <Select value={handicapFilter} onChange={(e) => setHandicapFilter(e.target.value)} className="w-[140px] bg-white">
                <option value="all">Any Medical</option>
                <option value="true">Handicap: Yes</option>
                <option value="false">Handicap: No</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : applicants && applicants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Centre</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">
                      {a.applicantName}
                      <div className="text-xs text-muted-foreground mt-0.5">Age: {a.age}</div>
                    </TableCell>
                    <TableCell>
                      {a.phone}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={a.centreName}>{a.centreName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          a.coupleOrSingle === 'Couple' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {a.coupleOrSingle}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          {a.gender}
                        </span>
                        {a.handicap && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                            Handicap
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatSimpleDate(a.dateOfArrival)}
                      <div className="text-xs text-muted-foreground mt-0.5">{a.timeOfArrival}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/applicants/${a.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10" asChild>
                          <Link href={`/applicants/add?edit=${a.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(a.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-24 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium text-foreground mb-1">No records found</h3>
              <p>Try adjusting your search or filters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the applicant
              record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Record'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
