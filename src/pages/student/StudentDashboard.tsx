import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Building2, Star, Search, Filter, Briefcase } from 'lucide-react';
import { authService, Job, StudentProfile, Application } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

const StudentDashboard = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiScores, setAiScores] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm]);

  const loadData = () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const userProfile = authService.getProfile(currentUser.id) as StudentProfile;
    setProfile(userProfile);

    const allJobs = authService.getJobs().filter(job => job.status === 'active');
    setJobs(allJobs);

    const userApplications = authService.getApplications().filter(app => app.studentId === currentUser.id);
    setApplications(userApplications);

    // Calculate AI scores
    if (userProfile) {
      const scores: Record<string, number> = {};
      allJobs.forEach(job => {
        scores[job.id] = authService.calculateAIScore(userProfile, job);
      });
      setAiScores(scores);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by AI score
    filtered.sort((a, b) => (aiScores[b.id] || 0) - (aiScores[a.id] || 0));
    
    setFilteredJobs(filtered);
  };

  const handleApply = (job: Job) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    const existingApplication = applications.find(app => app.jobId === job.id);
    if (existingApplication) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this position.",
        variant: "destructive",
      });
      return;
    }

    const newApplication: Application = {
      id: Date.now().toString(),
      jobId: job.id,
      studentId: currentUser.id,
      companyId: job.companyId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      messages: [],
      aiScore: aiScores[job.id] || 0,
    };

    authService.saveApplication(newApplication);
    setApplications([...applications, newApplication]);
    
    toast({
      title: "Application Submitted!",
      description: `Your application for ${job.title} has been submitted.`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const hasApplied = (jobId: string) => {
    return applications.some(app => app.jobId === jobId);
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
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile.name}!</h1>
            <p className="text-white/90">Discover opportunities tailored just for you</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.slice(0, 5).map(skill => (
                <Badge key={skill} variant="secondary" className="bg-white/20 text-white">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{applications.length}</div>
              <p className="text-xs text-muted-foreground">
                {applications.filter(app => app.status === 'pending').length} pending
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Match</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.round(filteredJobs.reduce((acc, job) => acc + (aiScores[job.id] || 0), 0) / filteredJobs.length) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">Average compatibility</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Positions</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredJobs.length}</div>
              <p className="text-xs text-muted-foreground">New opportunities</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search internships..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recommended for You</h2>
            <Badge variant="secondary">{filteredJobs.length} positions</Badge>
          </div>
          
          <div className="grid gap-6">
            {filteredJobs.length === 0 ? (
              <Card className="shadow-card">
                <CardContent className="py-8 text-center">
                  <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No internships found</h3>
                  <p className="text-muted-foreground">Try adjusting your search terms or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="shadow-card hover:shadow-elegant transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {job.title}
                          <div className="flex items-center gap-2 ml-auto">
                            <div className={`w-2 h-2 rounded-full ${getScoreColor(aiScores[job.id] || 0)}`} />
                            <span className="text-sm font-normal text-muted-foreground">
                              {aiScores[job.id] || 0}% match
                            </span>
                          </div>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            Company #{job.companyId}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(job.postedAt).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm">{job.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Required Skills:</div>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Profile Match</span>
                          <span className="font-medium">{aiScores[job.id] || 0}%</span>
                        </div>
                        <Progress value={aiScores[job.id] || 0} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                          {job.salary && <span>Salary: {job.salary}</span>}
                        </div>
                        <Button
                          onClick={() => handleApply(job)}
                          disabled={hasApplied(job.id)}
                          variant={hasApplied(job.id) ? "secondary" : "default"}
                        >
                          {hasApplied(job.id) ? 'Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;