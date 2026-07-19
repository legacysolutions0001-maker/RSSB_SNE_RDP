import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getRecentApplicants } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, UserPlus, FileText, CheckCircle2, ShieldCheck, Activity, Users2, User } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: recent, isLoading: recentLoading } = useQuery({
    queryKey: ['recentApplicants'],
    queryFn: () => getRecentApplicants(10),
  });

  const StatCard = ({ title, value, icon: Icon, colorClass, loading }: any) => (
    <Card>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
          ) : (
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{value}</h3>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of SNE Accommodation centre statistics.</p>
        </div>
        <Button asChild>
          <Link href="/applicants/add">
            <UserPlus className="h-4 w-4 mr-2" /> Add Applicant
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard 
          title="Total Applicants" 
          value={stats?.totalApplicants} 
          icon={Users} 
          colorClass="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Today's Arrivals" 
          value={stats?.todayApplicants} 
          icon={Activity} 
          colorClass="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Couples" 
          value={stats?.coupleCount} 
          icon={Users2} 
          colorClass="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Singles" 
          value={stats?.singleCount} 
          icon={User} 
          colorClass="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
          loading={statsLoading} 
        />
        
        <StatCard 
          title="Male" 
          value={stats?.maleCount} 
          icon={User} 
          colorClass="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Female" 
          value={stats?.femaleCount} 
          icon={User} 
          colorClass="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Handicap" 
          value={stats?.handicapCount} 
          icon={CheckCircle2} 
          colorClass="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          loading={statsLoading} 
        />
        <StatCard 
          title="Total Admins" 
          value={stats?.totalAdmins} 
          icon={ShieldCheck} 
          colorClass="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
          loading={statsLoading} 
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div>
            <CardTitle className="text-xl font-serif">Recent Applicants</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Latest arrivals recorded in the system.</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/applicants">View All</Link>
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {recentLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : recent && recent.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Centre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Arrival Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((applicant) => (
                  <TableRow key={applicant.id}>
                    <TableCell className="font-medium">{applicant.applicantName}</TableCell>
                    <TableCell>{applicant.centreName}</TableCell>
                    <TableCell>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        applicant.coupleOrSingle === 'Couple' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {applicant.coupleOrSingle}
                      </span>
                    </TableCell>
                    <TableCell>{applicant.gender}</TableCell>
                    <TableCell>{formatDate(applicant.createdDate)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/applicants/${applicant.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No applicants recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
