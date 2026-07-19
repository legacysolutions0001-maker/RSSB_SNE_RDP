import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as db from "@/lib/db";
import { toast } from "@/hooks/use-toast";

export const applicantKeys = {
  all: ['applicants'] as const,
  lists: () => [...applicantKeys.all, 'list'] as const,
  list: (filters: string) => [...applicantKeys.lists(), { filters }] as const,
  details: () => [...applicantKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicantKeys.details(), id] as const,
  dashboard: () => ['dashboardStats'] as const,
  recent: () => ['recentApplicants'] as const,
};

export const adminKeys = {
  all: ['admins'] as const,
};

export function useApplicants(filters?: { gender?: string; coupleOrSingle?: string; handicap?: boolean; search?: string }) {
  return useQuery({
    queryKey: applicantKeys.list(JSON.stringify(filters)),
    queryFn: () => db.getApplicants(filters),
  });
}

export function useApplicant(id: string) {
  return useQuery({
    queryKey: applicantKeys.detail(id),
    queryFn: () => db.getApplicant(id),
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: applicantKeys.dashboard(),
    queryFn: () => db.getDashboardStats(),
  });
}

export function useRecentApplicants(n: number = 10) {
  return useQuery({
    queryKey: applicantKeys.recent(),
    queryFn: () => db.getRecentApplicants(n),
  });
}

export function useAdmins() {
  return useQuery({
    queryKey: adminKeys.all,
    queryFn: () => db.getAdmins(),
  });
}

export function useAddApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, createdBy }: { data: Omit<db.Applicant, "id" | "createdDate">, createdBy: string }) => db.addApplicant(data, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.all });
    },
    onError: (error: any) => {
      toast({ title: "Failed to add applicant", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Omit<db.Applicant, "id">> }) => db.updateApplicant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.all });
      queryClient.invalidateQueries({ queryKey: applicantKeys.detail(variables.id) });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update applicant", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteApplicant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteApplicant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.all });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete applicant", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<db.AdminRecord> }) => db.updateAdmin(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update admin", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => db.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete admin", description: error.message, variant: "destructive" });
    }
  });
}
