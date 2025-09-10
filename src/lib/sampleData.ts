import { authService, Job, Application } from './auth';

// Sample data generator for demo purposes
export const generateSampleData = () => {
  // Only generate if no data exists
  const existingJobs = authService.getJobs();
  if (existingJobs.length > 0) return;

  // Sample jobs
  const sampleJobs: Job[] = [
    {
      id: 'job-1',
      companyId: 'company-demo',
      title: 'Frontend Developer Intern',
      description: 'Join our dynamic team to build modern web applications using React, TypeScript, and cutting-edge technologies. You\'ll work on real projects that impact thousands of users.',
      requirements: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Git'],
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$2000/month',
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      applications: [],
      status: 'active',
    },
    {
      id: 'job-2',
      companyId: 'company-demo',
      title: 'Data Science Intern',
      description: 'Dive into the world of data science and machine learning. Work with large datasets, build predictive models, and create insights that drive business decisions.',
      requirements: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Pandas'],
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$2200/month',
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
      applications: [],
      status: 'active',
    },
    {
      id: 'job-3',
      companyId: 'company-demo-2',
      title: 'UX/UI Design Intern',
      description: 'Create beautiful and intuitive user experiences. Work alongside our design team to prototype, test, and implement user-centered design solutions.',
      requirements: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research', 'Design Systems'],
      location: 'Remote',
      type: 'Part-time',
      salary: '$1500/month',
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      applications: [],
      status: 'active',
    },
    {
      id: 'job-4',
      companyId: 'company-demo-2',
      title: 'Backend Developer Intern',
      description: 'Build scalable backend systems and APIs. Learn about microservices, databases, and cloud infrastructure while working on production systems.',
      requirements: ['Node.js', 'Express', 'MongoDB', 'AWS', 'Docker'],
      location: 'Austin, TX',
      type: 'Full-time',
      salary: '$2100/month',
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
      applications: [],
      status: 'active',
    },
    {
      id: 'job-5',
      companyId: 'company-demo-3',
      title: 'Marketing Analytics Intern',
      description: 'Analyze marketing performance, create reports, and help optimize campaigns. Perfect for students interested in the intersection of marketing and data.',
      requirements: ['Google Analytics', 'Excel', 'SQL', 'Data Visualization', 'Marketing'],
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$1800/month',
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      applications: [],
      status: 'active',
    },
    {
      id: 'job-6',
      companyId: 'company-demo-3',
      title: 'Mobile App Developer Intern',
      description: 'Develop native mobile applications for iOS and Android. Work with React Native and native SDKs to create engaging mobile experiences.',
      requirements: ['React Native', 'iOS', 'Android', 'JavaScript', 'Mobile UI/UX'],
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$2300/month',
      postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
      applications: [],
      status: 'active',
    }
  ];

  // Save sample jobs
  sampleJobs.forEach(job => {
    authService.saveJob(job);
  });

  console.log('Sample data generated successfully!');
};

// Initialize sample data when the module is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  setTimeout(() => {
    generateSampleData();
  }, 100);
}