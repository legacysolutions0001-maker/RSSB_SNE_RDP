import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useLocation } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addApplicant, getApplicant, updateApplicant } from '@/lib/db';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select-simple';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

export default function AddApplicant() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const editId = searchParams.get('edit');
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: editData, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['applicant', editId],
    queryFn: () => getApplicant(editId!),
    enabled: !!editId,
  });

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      applicantName: '',
      age: '',
      phone: '',
      gender: 'Male',
      medicalIssues: '',
      handicap: false,
      coupleOrSingle: 'Single',
      centreName: '',
      centreAddress: '',
      guardianNominee: '',
      dateOfArrival: new Date().toISOString().split('T')[0],
      timeOfArrival: new Date().toTimeString().split(' ')[0].substring(0, 5),
    }
  });

  useEffect(() => {
    if (editData) {
      reset({
        ...editData,
        age: editData.age.toString(),
      });
    }
  }, [editData, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = { ...data, age: Number(data.age) };
      if (editId) {
        await updateApplicant(editId, payload);
        return editId;
      } else {
        return await addApplicant(payload, profile?.fullName || profile?.email || 'System');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      toast({
        title: editId ? "Record Updated" : "Record Created",
        description: "Applicant information saved successfully.",
      });
      setLocation('/applicants');
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error Saving Record",
        description: error.message || "Something went wrong.",
      });
    }
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  if (editId && isLoadingEdit) {
    return <div className="flex justify-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">
            {editId ? 'Edit Applicant Record' : 'New Applicant Registration'}
          </h1>
          <p className="text-muted-foreground mt-1">Fill in the accommodation details carefully.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-8">
          <Card className="border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Full Name *</Label>
                <Input id="applicantName" {...register('applicantName', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" {...register('age', { required: true, min: 1 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" {...register('phone', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select id="gender" {...register('gender')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Transgender">Transgender</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coupleOrSingle">Accommodation Type *</Label>
                <Select id="coupleOrSingle" {...register('coupleOrSingle')}>
                  <option value="Single">Single</option>
                  <option value="Couple">Couple</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianNominee">Guardian / Nominee Name</Label>
                <Input id="guardianNominee" {...register('guardianNominee')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Centre Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="centreName">Satsang Centre Name *</Label>
                <Input id="centreName" {...register('centreName', { required: true })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="centreAddress">Centre Full Address</Label>
                <Textarea id="centreAddress" {...register('centreAddress')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="text-lg">Arrival & Medical</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dateOfArrival">Date of Arrival *</Label>
                <Input id="dateOfArrival" type="date" {...register('dateOfArrival', { required: true })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeOfArrival">Time of Arrival *</Label>
                <Input id="timeOfArrival" type="time" {...register('timeOfArrival', { required: true })} />
              </div>
              
              <div className="space-y-2 md:col-span-2 border-t pt-6 mt-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Controller
                    name="handicap"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        id="handicap" 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    )}
                  />
                  <Label htmlFor="handicap" className="text-base cursor-pointer">Applicant is Handicapped</Label>
                </div>
                
                <Label htmlFor="medicalIssues">Medical Issues (if any)</Label>
                <Textarea id="medicalIssues" {...register('medicalIssues')} placeholder="List any ongoing treatments or necessary accommodations..." />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending} className="min-w-[150px]">
              {saveMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> Save Record</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
