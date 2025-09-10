import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Building2, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authService, Application, Job } from '@/lib/auth';

const StudentApplications = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const userApplications = authService.getApplications().filter(app => app.studentId === currentUser.id);
    setApplications(userApplications);

    // Load job details
    const allJobs = authService.getJobs();
    const jobsMap: Record<string, Job> = {};
    allJobs.forEach(job => {
      jobsMap[job.id] = job;
    });
    setJobs(jobsMap);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'reviewing':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'reviewing':
        return 50;
      case 'accepted':
        return 100;
      case 'rejected':
        return 100;
      default:
        return 0;
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status);
  };

  const renderApplicationCard = (application: Application) => {
    const job = jobs[application.jobId];
    if (!job) return null;

    return (
      <Card key={application.id} className="shadow-card hover:shadow-elegant transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2">
                {job.title}
                <Badge className={`${getStatusColor(application.status)} capitalize`}>
                  {application.status}
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Company #{job.companyId}
                </span>
                <span>Applied {new Date(application.appliedAt).toLocaleDateString()}</span>
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(application.status)}
              <span className="text-sm font-medium">{application.aiScore}% match</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{job.description}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Application Progress</span>
                <span className="font-medium capitalize">{application.status}</span>
              </div>
              <Progress value={getProgressValue(application.status)} className="h-2" />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Location: {job.location} • Type: {job.type}
              </div>
              <Button variant="outline" size="sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Message ({application.messages.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">Track your internship applications and their progress</p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{getApplicationsByStatus('pending').length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{getApplicationsByStatus('accepted').length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.length > 0 ? Math.round(getApplicationsByStatus('accepted').length / applications.length * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Applications by Status */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({getApplicationsByStatus('pending').length})</TabsTrigger>
            <TabsTrigger value="reviewing">Reviewing ({getApplicationsByStatus('reviewing').length})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({getApplicationsByStatus('accepted').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({getApplicationsByStatus('rejected').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6 mt-6">
            {applications.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-8 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground mb-4">Start applying to internships from your dashboard.</p>
                  <Button onClick={() => window.location.href = '/student/dashboard'}>
                    Browse Internships
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {applications.map(renderApplicationCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {getApplicationsByStatus('pending').map(renderApplicationCard)}
            </div>
          </TabsContent>

          <TabsContent value="reviewing" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {getApplicationsByStatus('reviewing').map(renderApplicationCard)}
            </div>
          </TabsContent>

          <TabsContent value="accepted" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {getApplicationsByStatus('accepted').map(renderApplicationCard)}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-6 mt-6">
            <div className="grid gap-6">
              {getApplicationsByStatus('rejected').map(renderApplicationCard)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentApplications;