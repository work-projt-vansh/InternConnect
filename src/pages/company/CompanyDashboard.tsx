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
import { Plus, Users, Briefcase, TrendingUp, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { authService, Job, CompanyProfile, Application, StudentProfile } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const CompanyDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobApplications, setJobApplications] = useState<Application[]>([]);
  const [isPostingJob, setIsPostingJob] = useState(false);
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

    // Reset form
    (e.target as HTMLFormElement).reset();
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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-hero rounded-lg p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">Welcome, {profile.companyName}!</h1>
            <p className="text-white/90">Manage your internship postings and connect with talented students</p>
            <div className="mt-4">
              <Badge className="bg-white/20 text-white">
                {profile.industry}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.filter(j => j.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">Currently accepting applications</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {getApplicationsByStatus('pending')} pending review
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{getApplicationsByStatus('accepted')}</div>
              <p className="text-xs text-muted-foreground">Successful placements</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {applications.length > 0 ? Math.round((getApplicationsByStatus('accepted') + getApplicationsByStatus('rejected')) / applications.length * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Applications processed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <Dialog open={isPostingJob} onOpenChange={setIsPostingJob}>
            <DialogTrigger asChild>
              <Button className="shadow-glow">
                <Plus className="mr-2 h-4 w-4" />
                Post New Internship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Post New Internship</DialogTitle>
                <DialogDescription>
                  Create a new internship opportunity for students to apply to.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePostJob} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Input id="type" name="type" placeholder="Full-time, Part-time, Remote" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salary (optional)</Label>
                  <Input id="salary" name="salary" placeholder="$1000/month" />
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

        {/* Job Listings */}
        <div className="grid gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Job Postings</h2>
            <Badge variant="secondary">{jobs.length} total</Badge>
          </div>

          {jobs.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-8 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">Start by posting your first internship opportunity.</p>
                <Button onClick={() => setIsPostingJob(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Job
                </Button>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => {
              const jobApplicationCount = applications.filter(app => app.jobId === job.id).length;
              const pendingCount = applications.filter(app => app.jobId === job.id && app.status === 'pending').length;
              
              return (
                <Card key={job.id} className="shadow-card hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {job.title}
                          <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                            {job.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {job.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Location:</span> {job.location}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span> {job.type}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Posted:</span> {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Applications:</span> {jobApplicationCount}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="flex gap-2">
                          {pendingCount > 0 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {pendingCount} new
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" onClick={() => viewJobApplications(job)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Applications ({jobApplicationCount})
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

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
                jobApplications.map((application) => {
                  const studentProfile = authService.getProfile(application.studentId) as StudentProfile;
                  
                  return (
                    <Card key={application.id} className="shadow-card">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {studentProfile?.name || `Student #${application.studentId}`}
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(application.status)}`} />
                                <Badge variant="outline" className="capitalize">
                                  {application.status}
                                </Badge>
                              </div>
                            </CardTitle>
                            <CardDescription>
                              Applied {new Date(application.appliedAt).toLocaleDateString()}
                              {studentProfile?.email && ` • ${studentProfile.email}`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* AI Match Score */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>AI Match Score</span>
                              <span className="font-medium">{application.aiScore}%</span>
                            </div>
                            <Progress value={application.aiScore} className="h-2" />
                          </div>

                          {/* Student Profile Details */}
                          {studentProfile && (
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">LOCATION</h4>
                                  <p className="text-sm">{studentProfile.location || 'Not specified'}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">SKILLS</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {studentProfile.skills && studentProfile.skills.length > 0 ? (
                                      studentProfile.skills.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                          {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No skills listed</span>
                                    )}
                                  </div>
                                </div>

                                {studentProfile.preferences && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">PREFERENCES</h4>
                                    <div className="space-y-2">
                                      {studentProfile.preferences.jobTypes && studentProfile.preferences.jobTypes.length > 0 && (
                                        <div>
                                          <span className="text-xs text-muted-foreground">Job Types: </span>
                                          <span className="text-sm">{studentProfile.preferences.jobTypes.join(', ')}</span>
                                        </div>
                                      )}
                                      {studentProfile.preferences.locations && studentProfile.preferences.locations.length > 0 && (
                                        <div>
                                          <span className="text-xs text-muted-foreground">Preferred Locations: </span>
                                          <span className="text-sm">{studentProfile.preferences.locations.join(', ')}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">BIO</h4>
                                  <p className="text-sm leading-relaxed">
                                    {studentProfile.bio || 'No bio provided'}
                                  </p>
                                </div>
                                
                                {studentProfile.resumeUrl && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-muted-foreground mb-2">RESUME</h4>
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={studentProfile.resumeUrl} target="_blank" rel="noopener noreferrer">
                                        View Resume
                                      </a>
                                    </Button>
                                  </div>
                                )}

                                <div>
                                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">MEMBER SINCE</h4>
                                  <p className="text-sm">
                                    {new Date(studentProfile.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Action buttons */}
                          {application.status === 'pending' && (
                            <div className="flex gap-2 pt-4 border-t">
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
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CompanyDashboard;