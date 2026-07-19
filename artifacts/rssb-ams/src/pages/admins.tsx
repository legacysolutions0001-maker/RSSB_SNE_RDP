import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdmins, updateAdmin, deleteAdmin } from '@/lib/db';
import { createAdminRecord, buildInternalEmail } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select-simple';
import { ShieldCheck, ShieldAlert, Plus, Edit, Trash2, PowerOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const emptyForm = {
  id: '',
  fullName: '',
  username: '',
  password: '',
  phone: '',
  address: '',
  designation: '',
  role: 'admin',
  status: 'active',
};

export default function Admins() {
  const { isSuperAdmin, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: getAdmins,
    enabled: isSuperAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.id) {
        // ── Edit existing admin ──────────────────────────────────────────────
        const { id, password, username, ...updateData } = data;
        // Username is immutable after creation; password reset is separate
        await updateAdmin(id, updateData as any);
      } else {
        // ── Create new admin ─────────────────────────────────────────────────
        if (!auth) throw new Error("Firebase is not configured.");

        const usernameClean = data.username.trim().toLowerCase();
        if (!usernameClean) throw new Error("Username is required.");
        if (data.password.length < 6) throw new Error("Password must be at least 6 characters.");

        // Internal email — never shown to the user
        const internalEmail = buildInternalEmail(usernameClean);

        const cred = await createUserWithEmailAndPassword(auth, internalEmail, data.password);
        await createAdminRecord(cred.user.uid, {
          fullName: data.fullName,
          email: internalEmail,
          phone: data.phone,
          address: data.address,
          designation: data.designation,
          username: usernameClean,
          role: data.role as 'admin' | 'super_admin',
          status: data.status as 'active' | 'disabled',
          createdBy: profile?.username || profile?.fullName || 'Super Admin',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: "Success", description: "Admin record saved successfully." });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast({ title: "Deleted", description: "Admin removed from the system." });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await updateAdmin(id, { status: status as 'active' | 'disabled' });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admins'] }),
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center text-destructive font-medium">
        Unauthorized access. This section is for Super Admin only.
      </div>
    );
  }

  const openNew = () => {
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (admin: any) => {
    setFormData({ ...emptyForm, ...admin, password: '' });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-slate-900">Admin Management</h1>
          <p className="text-muted-foreground mt-1">Super Admin controls for system access.</p>
        </div>
        <Button onClick={openNew} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Create Admin
        </Button>
      </div>

      <Card className="border-t-4 border-t-slate-900">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins?.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div className="font-medium">{admin.fullName}</div>
                      <div className="text-xs text-muted-foreground">{admin.phone}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{admin.username}</TableCell>
                    <TableCell>{admin.designation}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 text-xs font-medium ${admin.role === 'super_admin' ? 'text-primary' : 'text-slate-600'}`}>
                        {admin.role === 'super_admin' ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                        {admin.role.replace('_', ' ').toUpperCase()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        admin.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(admin.createdDate)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatusMutation.mutate({
                            id: admin.id,
                            status: admin.status === 'active' ? 'disabled' : 'active',
                          })}
                          title={admin.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
                          disabled={admin.id === profile?.uid}
                        >
                          <PowerOff className={`h-4 w-4 ${admin.status === 'active' ? 'text-red-500' : 'text-green-500'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(admin)} title="Edit Admin">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(admin.id)}
                          disabled={admin.id === profile?.uid || admin.role === 'super_admin'}
                          title="Delete Admin"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Edit Admin' : 'Create New Admin'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input required value={formData.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="e.g. Rajesh Kumar" />
            </div>

            <div className="space-y-2">
              <Label>Username *</Label>
              <Input
                required
                disabled={!!formData.id}
                value={formData.username}
                onChange={(e) => update('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                placeholder="e.g. rajesh01"
                autoComplete="off"
              />
              {!formData.id && (
                <p className="text-xs text-muted-foreground">Username cannot be changed after creation.</p>
              )}
            </div>

            {!formData.id && (
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input value={formData.designation} onChange={(e) => update('designation', e.target.value)} placeholder="e.g. Seva Dal" />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={formData.phone} onChange={(e) => update('phone', e.target.value)} placeholder="e.g. 9876543210" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={formData.address} onChange={(e) => update('address', e.target.value)} placeholder="Full address" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={formData.role} onChange={(e) => update('role', e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onChange={(e) => update('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </Select>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {saveMutation.isPending ? 'Saving...' : 'Save Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the admin's access to the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
