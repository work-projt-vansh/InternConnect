import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Edit3,
  Trash2,
  PauseCircle,
  PlayCircle,
  Calendar,
  MapPin,
  DollarSign,
  Clock
} from 'lucide-react';
import { authService, Job, CompanyProfile, Application } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CompanyJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [isPostingJob, setIsPostingJob] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const userProfile = authService.getProfile(currentUser.id) as CompanyProfile;
    setProfile(userProfile);

    const companyJobs = authService.getJobs().filter(job => job.companyId === currentUser.id);
    setJobs(companyJobs);

    const companyApplications = authService.getApplications().filter(app => app.companyId === currentUser.id);
    setApplications(companyApplications);
  };

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    
    const newJob: Job = {
      id: Date.now().toString(),
      companyId: currentUser.id,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      requirements: (formData.get('requirements') as string).split(',').map(r => r.trim()).filter(Boolean),
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      salary: formData.get('salary') as string || undefined,
      postedAt: new Date().toISOString(),
      applications: [],
      status: 'active',
    };

    authService.saveJob(newJob);
    setJobs([...jobs, newJob]);
    setIsPostingJob(false);
    
    toast({
      title: "Job Posted Successfully!",
      description: `${newJob.title} is now live and accepting applications.`,
    });

    (e.target as HTMLFormElement).reset();
  };

  const handleEditJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingJob) return;

    const formData = new FormData(e.currentTarget);
    
    const updatedJob: Job = {
      ...editingJob,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      requirements: (formData.get('requirements') as string).split(',').map(r => r.trim()).filter(Boolean),
      location: formData.get('location') as string,
      type: formData.get('type') as string,
      salary: formData.get('salary') as string || undefined,
    };

    authService.saveJob(updatedJob);
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job));
    setEditingJob(null);
    
    toast({
      title: "Job Updated Successfully!",
      description: `${updatedJob.title} has been updated.`,
    });
  };

  const handleDeleteJob = (jobId: string) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);
    
    // Note: In a real app, you'd need to handle deleting from localStorage
    const allJobs = authService.getJobs().filter(job => job.id !== jobId);
    localStorage.setItem('internship_jobs', JSON.stringify(allJobs));
    
    toast({
      title: "Job Deleted",
      description: "The job posting has been removed.",
    });
  };

  const handleJobStatusToggle = (job: Job) => {
    const updatedJob = { ...job, status: job.status === 'active' ? 'closed' : 'active' } as Job;
    authService.saveJob(updatedJob);
    setJobs(jobs.map(j => j.id === job.id ? updatedJob : j));
    
    toast({
      title: `Job ${updatedJob.status === 'active' ? 'Activated' : 'Closed'}`,
      description: `${updatedJob.title} is now ${updatedJob.status}.`,
    });
  };

  const handleApplicationAction = (applicationId: string, action: 'accepted' | 'rejected') => {
    const updatedApplications = applications.map(app => 
      app.id === applicationId ? { ...app, status: action } : app
    );
    
    const application = updatedApplications.find(app => app.id === applicationId);
    if (application) {
      authService.saveApplication(application);
      setApplications(updatedApplications);
      setJobApplications(jobApplications.map(app => 
        app.id === applicationId ? application : app
      ));
      
      toast({
        title: `Application ${action}`,
        description: `The application has been ${action}.`,
      });
    }
  };

  const viewJobApplications = (job: Job) => {
    const jobApps = applications.filter(app => app.jobId === job.id);
    setSelectedJob(job);
    setJobApplications(jobApps);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'reviewing': return 'bg-blue-500';
      case 'accepted': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFilteredJobs = () => {
    switch (activeTab) {
      case 'active': return jobs.filter(job => job.status === 'active');
      case 'closed': return jobs.filter(job => job.status === 'closed');
      default: return jobs;
    }
  };

  const getApplicationsByStatus = (status: string) => {
    return applications.filter(app => app.status === status).length;
  };

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-hero rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Manage Jobs</h1>
            <p className="text-white/90">Create, edit, and manage your internship postings</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-white/80">Total Jobs</div>
                <div className="text-2xl font-bold">{jobs.length}</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-white/80">Active Jobs</div>
                <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'active').length}</div>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-sm text-white/80">Applications</div>
                <div className="text-2xl font-bold">{applications.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Dialog open={isPostingJob} onOpenChange={setIsPostingJob}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Post New Job</DialogTitle>
                <DialogDescription>
                  Create a new internship opportunity for students to apply to.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Remote">Remote</SelectItem>
                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salary (optional)</Label>
                    <Input id="salary" name="salary" placeholder="$1000/month" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Input id="requirements" name="requirements" placeholder="JavaScript, React, Node.js" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" rows={4} required />
                </div>
                <Button type="submit" className="w-full">Post Job</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Jobs Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({jobs.filter(j => j.status === 'active').length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({jobs.filter(j => j.status === 'closed').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {getFilteredJobs().length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-12 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {activeTab === 'all' ? 'No jobs posted yet' : `No ${activeTab} jobs`}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'all' 
                      ? 'Start by posting your first internship opportunity.'
                      : `You don't have any ${activeTab} job postings.`
                    }
                  </p>
                  {activeTab === 'all' && (
                    <Button onClick={() => setIsPostingJob(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Post Your First Job
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {getFilteredJobs().map((job) => {
                  const jobApplicationCount = applications.filter(app => app.jobId === job.id).length;
                  const pendingCount = applications.filter(app => app.jobId === job.id && app.status === 'pending').length;
                  
                  return (
                    <Card key={job.id} className="shadow-card hover:shadow-elegant transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2">
                              {job.title}
                              <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                                {job.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mb-4">
                              {job.description}
                            </CardDescription>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {job.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {job.type}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(job.postedAt).toLocaleDateString()}
                              </div>
                              {job.salary && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  {job.salary}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingJob(job)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleJobStatusToggle(job)}
                            >
                              {job.status === 'active' ? (
                                <PauseCircle className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{job.title}"? This action cannot be undone and will remove all applications.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{jobApplicationCount} applications</span>
                              </div>
                              {pendingCount > 0 && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  {pendingCount} pending
                                </Badge>
                              )}
                            </div>
                            <Button variant="outline" onClick={() => viewJobApplications(job)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Applications
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Job Dialog */}
        <Dialog open={editingJob !== null} onOpenChange={() => setEditingJob(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>
                Update the job posting details.
              </DialogDescription>
            </DialogHeader>
            {editingJob && (
              <form onSubmit={handleEditJob} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Job Title</Label>
                    <Input id="edit-title" name="title" defaultValue={editingJob.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input id="edit-location" name="location" defaultValue={editingJob.location} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-type">Type</Label>
                    <Input id="edit-type" name="type" defaultValue={editingJob.type} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salary">Salary (optional)</Label>
                    <Input id="edit-salary" name="salary" defaultValue={editingJob.salary || ''} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-requirements">Requirements (comma-separated)</Label>
                  <Input 
                    id="edit-requirements" 
                    name="requirements" 
                    defaultValue={editingJob.requirements.join(', ')} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea 
                    id="edit-description" 
                    name="description" 
                    rows={4} 
                    defaultValue={editingJob.description} 
                    required 
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">Update Job</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingJob(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Applications Modal */}
        <Dialog open={selectedJob !== null} onOpenChange={() => setSelectedJob(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Applications for {selectedJob?.title}</DialogTitle>
              <DialogDescription>
                Review and manage applications for this position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {jobApplications.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">Applications will appear here when students apply.</p>
                </div>
              ) : (
                jobApplications.map((application) => (
                  <Card key={application.id} className="shadow-card">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Student #{application.studentId}</CardTitle>
                          <CardDescription>
                            Applied {new Date(application.appliedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(application.status)}`} />
                          <Badge variant="outline" className="capitalize">
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>AI Match Score</span>
                            <span className="font-medium">{application.aiScore}%</span>
                          </div>
                          <Progress value={application.aiScore} className="h-2" />
                        </div>
                        
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApplicationAction(application.id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApplicationAction(application.id, 'rejected')}
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Message
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CompanyJobs;