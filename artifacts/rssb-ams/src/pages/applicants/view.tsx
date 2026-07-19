import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplicant, deleteApplicant } from '@/lib/db';
import { useRoute, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatSimpleDate } from '@/lib/utils';
import { Loader2, ArrowLeft, Edit, Trash2, Printer, MapPin, Phone, User, Activity, Clock, Shield } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

export default function ViewApplicant() {
  const [, params] = useRoute('/applicants/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const id = params?.id;

  const { data: applicant, isLoading } = useQuery({
    queryKey: ['applicant', id],
    queryFn: () => getApplicant(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplicant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      toast({ title: "Record Deleted", description: "Applicant removed." });
      setLocation('/applicants');
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!applicant) {
    return <div className="text-center py-24">Record not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in pb-12 print:p-0 print:m-0">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Applicant Profile</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button onClick={() => setLocation(`/applicants/add?edit=${applicant.id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
        <h1 className="text-2xl font-serif font-bold">Radha Swami Satsang Beas</h1>
        <p className="text-lg">SNE Old Enclosure Accommodation - Rudrapur</p>
        <h2 className="text-xl font-bold mt-4 underline">Applicant Official Record</h2>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md print:shadow-none print:border-black">
        <CardHeader className="bg-muted/20 border-b print:bg-transparent">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-1">{applicant.applicantName}</CardTitle>
              <div className="text-sm text-muted-foreground flex items-center gap-4">
                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> Age: {applicant.age}</span>
                <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {applicant.phone}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full print:border print:border-black print:text-black">
                {applicant.coupleOrSingle}
              </span>
              <div className="mt-2 text-sm font-medium">{applicant.gender}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x print:divide-x print:divide-y-0 print:border-b print:border-black">
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Centre Details
                </h3>
                <div className="bg-muted/10 p-4 rounded-lg border print:border-none print:p-0">
                  <p className="font-medium text-lg mb-1">{applicant.centreName}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{applicant.centreAddress || 'No address provided'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Guardian / Nominee
                </h3>
                <p className="font-medium text-base">{applicant.guardianNominee || 'None provided'}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Arrival Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/10 p-4 rounded-lg border print:border-none print:p-0">
                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{formatSimpleDate(applicant.dateOfArrival)}</p>
                  </div>
                  <div className="bg-muted/10 p-4 rounded-lg border print:border-none print:p-0">
                    <p className="text-xs text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{applicant.timeOfArrival}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Medical Information
                </h3>
                <div className="space-y-3">
                  {applicant.handicap && (
                    <span className="inline-block px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded print:border print:border-black">
                      HANDICAPPED
                    </span>
                  )}
                  <div className="bg-muted/10 p-4 rounded-lg border min-h-[80px] print:border-none print:p-0">
                    <p className="text-sm whitespace-pre-wrap">
                      {applicant.medicalIssues || 'No medical issues reported.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t py-3 text-xs text-muted-foreground flex justify-between print:bg-transparent print:border-black">
          <span>Record ID: {applicant.id}</span>
          <span>Created by {applicant.createdBy} on {formatDate(applicant.createdDate)}</span>
        </CardFooter>
      </Card>

      <div className="hidden print:block mt-24 text-sm">
        <div className="flex justify-between px-12">
          <div className="text-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p>Applicant Signature</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-black mb-2"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the record for {applicant.applicantName}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate(applicant.id)} className="bg-destructive hover:bg-destructive/90">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
