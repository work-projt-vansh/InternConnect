// Demo authentication system using localStorage
export interface User {
  id: string;
  email: string;
  role: 'student' | 'company';
  name: string;
  createdAt: string;
}

export interface StudentProfile extends User {
  role: 'student';
  skills: string[];
  location: string;
  bio: string;
  resumeUrl?: string;
  applications: Application[];
  preferences: {
    jobTypes: string[];
    locations: string[];
  };
}

export interface CompanyProfile extends User {
  role: 'company';
  companyName: string;
  industry: string;
  location: string;
  description: string;
  website?: string;
  jobs: Job[];
}

export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  type: string;
  salary?: string;
  postedAt: string;
  applications: Application[];
  status: 'active' | 'closed';
}

export interface Application {
  id: string;
  jobId: string;
  studentId: string;
  companyId: string;
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  appliedAt: string;
  messages: Message[];
  aiScore: number;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  applicationId?: string;
}

class AuthService {
  private readonly USERS_KEY = 'internship_users';
  private readonly CURRENT_USER_KEY = 'internship_current_user';
  private readonly JOBS_KEY = 'internship_jobs';
  private readonly APPLICATIONS_KEY = 'internship_applications';

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  async login(email: string, password: string): Promise<User> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'company';
    [key: string]: any;
  }): Promise<User> {
    const users = this.getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      role: userData.role,
      name: userData.name,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(newUser));

    // Create profile based on role
    if (userData.role === 'student') {
      this.createStudentProfile(newUser, userData);
    } else {
      this.createCompanyProfile(newUser, userData);
    }

    return newUser;
  }

  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  private getUsers(): User[] {
    const usersStr = localStorage.getItem(this.USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  private createStudentProfile(user: User, data: any): void {
    const profile: StudentProfile = {
      ...user,
      role: 'student',
      skills: data.skills || [],
      location: data.location || '',
      bio: data.bio || '',
      applications: [],
      preferences: {
        jobTypes: [],
        locations: []
      }
    };
    this.saveProfile(profile);
  }

  private createCompanyProfile(user: User, data: any): void {
    const profile: CompanyProfile = {
      ...user,
      role: 'company',
      companyName: data.companyName || data.name,
      industry: data.industry || '',
      location: data.location || '',
      description: data.description || '',
      website: data.website,
      jobs: []
    };
    this.saveProfile(profile);
  }

  saveProfile(profile: StudentProfile | CompanyProfile): void {
    const profiles = this.getProfiles();
    const index = profiles.findIndex(p => p.id === profile.id);
    
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem('internship_profiles', JSON.stringify(profiles));
  }

  getProfile(userId: string): StudentProfile | CompanyProfile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === userId) || null;
  }

  private getProfiles(): (StudentProfile | CompanyProfile)[] {
    const profilesStr = localStorage.getItem('internship_profiles');
    return profilesStr ? JSON.parse(profilesStr) : [];
  }

  // Job management
  getJobs(): Job[] {
    const jobsStr = localStorage.getItem(this.JOBS_KEY);
    return jobsStr ? JSON.parse(jobsStr) : [];
  }

  saveJob(job: Job): void {
    const jobs = this.getJobs();
    const index = jobs.findIndex(j => j.id === job.id);
    
    if (index >= 0) {
      jobs[index] = job;
    } else {
      jobs.push(job);
    }
    
    localStorage.setItem(this.JOBS_KEY, JSON.stringify(jobs));
  }

  // Application management
  getApplications(): Application[] {
    const appsStr = localStorage.getItem(this.APPLICATIONS_KEY);
    return appsStr ? JSON.parse(appsStr) : [];
  }

  saveApplication(application: Application): void {
    const apps = this.getApplications();
    const index = apps.findIndex(a => a.id === application.id);
    
    if (index >= 0) {
      apps[index] = application;
    } else {
      apps.push(application);
    }
    
    localStorage.setItem(this.APPLICATIONS_KEY, JSON.stringify(apps));
  }

  // AI Matching simulation
  calculateAIScore(studentProfile: StudentProfile, job: Job): number {
    let score = 0;
    
    // Skills matching
    const matchingSkills = studentProfile.skills.filter(skill => 
      job.requirements.some(req => req.toLowerCase().includes(skill.toLowerCase()))
    );
    score += (matchingSkills.length / job.requirements.length) * 40;
    
    // Location matching
    if (studentProfile.location.toLowerCase().includes(job.location.toLowerCase()) ||
        job.location.toLowerCase().includes(studentProfile.location.toLowerCase())) {
      score += 30;
    }
    
    // Random factors for demo
    score += Math.random() * 30;
    
    return Math.min(100, Math.round(score));
  }
}

export const authService = new AuthService();