import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { GraduationCap, Building2, Briefcase, Users, TrendingUp, ArrowRight } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Landing = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'student' | 'company'>('student');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      if (isLoginMode) {
        const user = await authService.login(
          formData.get('email') as string,
          formData.get('password') as string
        );
        navigate(user.role === 'student' ? '/student/dashboard' : '/company/dashboard');
      } else {
        const userData = {
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          name: formData.get('name') as string,
          role: selectedRole,
          ...(selectedRole === 'student' ? {
            skills: (formData.get('skills') as string)?.split(',').map(s => s.trim()).filter(Boolean) || [],
            location: formData.get('location') as string || '',
            bio: formData.get('bio') as string || '',
          } : {
            companyName: formData.get('companyName') as string || formData.get('name') as string,
            industry: formData.get('industry') as string || '',
            location: formData.get('location') as string || '',
            description: formData.get('description') as string || '',
            website: formData.get('website') as string || '',
          })
        };
        
        const user = await authService.register(userData);
        toast({
          title: "Account created successfully!",
          description: "Welcome to InternConnect",
        });
        navigate(user.role === 'student' ? '/student/dashboard' : '/company/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/10 to-accent/20" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold text-white">
            Connect Students with
            <span className="block text-transparent bg-gradient-to-r from-white to-primary-foreground bg-clip-text">
              Dream Internships
            </span>
          </h1>
          <p className="mb-8 text-xl text-white/90 max-w-2xl mx-auto">
            The modern platform bridging talented students with innovative companies. 
            Find your perfect match with AI-powered recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="shadow-glow"
              onClick={() => {
                setIsLoginMode(false);
                setSelectedRole('student');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Join as Student
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white/10 text-white border-white/30 hover:bg-white hover:text-primary backdrop-blur-sm"
              onClick={() => {
                setIsLoginMode(false);
                setSelectedRole('company');
                document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Building2 className="mr-2 h-5 w-5" />
              Post Internships
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose InternConnect?</h2>
            <p className="text-muted-foreground text-lg">Empowering connections that shape careers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader className="text-center">
                <Briefcase className="mx-auto h-12 w-12 text-primary mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">AI-powered algorithm matches students with relevant opportunities based on skills and preferences.</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader className="text-center">
                <Users className="mx-auto h-12 w-12 text-primary mb-4" />
                <CardTitle>Direct Communication</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Seamless messaging system for direct communication between students and companies.</p>
              </CardContent>
            </Card>
            <Card className="shadow-card hover:shadow-elegant transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-primary mb-4" />
                <CardTitle>Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track applications, build profiles, and grow professionally with comprehensive tools.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Auth Section */}
      <section id="auth-section" className="py-20">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {isLoginMode ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
              <CardDescription>
                {isLoginMode ? 'Sign in to your account' : 'Create your account to begin'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLoginMode ? 'login' : 'register'} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" onClick={() => setIsLoginMode(true)}>
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" onClick={() => setIsLoginMode(false)}>
                    Register
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                      Sign In <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={selectedRole === 'student' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('student')}
                      className="flex-1"
                    >
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Student
                    </Button>
                    <Button
                      type="button"
                      variant={selectedRole === 'company' ? 'default' : 'outline'}
                      onClick={() => setSelectedRole('company')}
                      className="flex-1"
                    >
                      <Building2 className="mr-2 h-4 w-4" />
                      Company
                    </Button>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{selectedRole === 'student' ? 'Full Name' : 'Company Name'}</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input id="location" name="location" required />
                    </div>

                    {selectedRole === 'student' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="skills">Skills (comma-separated)</Label>
                          <Input 
                            id="skills" 
                            name="skills" 
                            placeholder="JavaScript, React, Python..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea 
                            id="bio" 
                            name="bio" 
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="industry">Industry</Label>
                          <Input id="industry" name="industry" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Website (optional)</Label>
                          <Input id="website" name="website" type="url" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">Company Description</Label>
                          <Textarea 
                            id="description" 
                            name="description" 
                            placeholder="Describe your company..."
                          />
                        </div>
                      </>
                    )}

                    <Button type="submit" className="w-full">
                      Create Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Landing;