require('dotenv').config();
const prisma = require('../src/lib/prisma');
const logger = require('../src/utils/logger');

if (process.env.NODE_ENV === 'production') {
  console.error('Production verilənlər bazasında seed əməliyyatı qadağandır.');
  process.exit(1);
}

if (process.env.ALLOW_DATABASE_RESET !== 'true') {
  console.error('Seed üçün ALLOW_DATABASE_RESET=true açıq şəkildə təyin edilməlidir.');
  process.exit(1);
}

async function main() {
  console.log('Seeding database...');

  // Development-only reset. Guards above prevent accidental production use.
  await prisma.application.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.job.deleteMany();
  await prisma.step.deleteMany();
  await prisma.career.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const careers = [
    {
      title: 'Frontend Developer',
      description: 'Build user interfaces with HTML, CSS, and JavaScript frameworks',
      steps: [
        { order: 1, title: 'HTML & CSS', description: 'Basics of markup and styling' },
        { order: 2, title: 'JavaScript Fundamentals', description: 'Core JS concepts' },
        { order: 3, title: 'Modern JS & Tooling', description: 'ES6+, bundlers, npm' },
        { order: 4, title: 'Framework (React/Vue)', description: 'Build SPAs' },
        { order: 5, title: 'State Management & Testing', description: 'Redux, Context, unit tests' },
        { order: 6, title: 'Performance & Deployment', description: 'Optimization and deployment' }
      ],
      jobs: [
        { title: 'Junior Frontend Developer', company: 'Acme Inc', location: 'Remote', description: 'Work on UI components' },
        { title: 'React Developer', company: 'Webify', location: 'Baku', description: 'Build apps with React' }
      ]
    },
    {
      title: 'Data Analyst',
      description: 'Analyze data and extract insights',
      steps: [
        { order: 1, title: 'Excel & SQL', description: 'Data wrangling basics' },
        { order: 2, title: 'Statistics Basics', description: 'Probability and stats' },
        { order: 3, title: 'Data Visualization', description: 'Charts and dashboards' },
        { order: 4, title: 'Python/R for Data', description: 'Programming for analysis' },
        { order: 5, title: 'Databases & ETL', description: 'Working with pipelines' },
        { order: 6, title: 'Advanced Modeling', description: 'Machine learning basics' }
      ],
      jobs: [
        { title: 'Data Analyst', company: 'DataWorks', location: 'Remote', description: 'Analyze datasets and create dashboards' }
      ]
    },
    {
      title: 'Digital Marketing Specialist',
      description: 'Promote brands and drive growth online',
      steps: [
        { order: 1, title: 'Marketing Fundamentals', description: 'Basics of marketing' },
        { order: 2, title: 'SEO & Content', description: 'Search optimization and content strategy' },
        { order: 3, title: 'Paid Ads', description: 'Google Ads and social ads' },
        { order: 4, title: 'Analytics', description: 'Measure ROAS and funnels' },
        { order: 5, title: 'Email & Automation', description: 'Nurture and automation' },
        { order: 6, title: 'Strategy & Growth', description: 'Scale campaigns' }
      ],
      jobs: [
        { title: 'Marketing Specialist', company: 'Brandly', location: 'Baku', description: 'Run campaigns and analyze results' }
      ]
    },
    {
      title: 'Graphic Designer',
      description: 'Design visuals for digital and print',
      steps: [
        { order: 1, title: 'Design Basics', description: 'Color, typography, layout' },
        { order: 2, title: 'Tools (Photoshop/Illustrator)', description: 'Design software' },
        { order: 3, title: 'Branding & Identity', description: 'Create visual systems' },
        { order: 4, title: 'UI Design Basics', description: 'Designing interfaces' },
        { order: 5, title: 'Portfolio & Freelancing', description: 'Build presence and clients' },
        { order: 6, title: 'Advanced Motion/3D', description: 'Optional advanced skills' }
      ],
      jobs: [
        { title: 'Junior Graphic Designer', company: 'Creative Studio', location: 'Baku', description: 'Design assets for clients' }
      ]
    },
    {
      title: 'Electrician',
      description: 'Install and maintain electrical systems',
      steps: [
        { order: 1, title: 'Safety & Basics', description: 'Electrical safety and basics' },
        { order: 2, title: 'Wiring & Circuits', description: 'Learn wiring and circuits' },
        { order: 3, title: 'Residential Systems', description: 'Home installations' },
        { order: 4, title: 'Commercial Systems', description: 'Larger installations' },
        { order: 5, title: 'Diagnostics & Troubleshooting', description: 'Diagnosis skills' },
        { order: 6, title: 'Certifications & Advanced', description: 'Certs and advanced topics' }
      ],
      jobs: [
        { title: 'Apprentice Electrician', company: 'ElectricCo', location: 'Baku', description: 'Assist on installs and learn on the job' }
      ]
    }
  ];

  for (const c of careers) {
    await prisma.career.create({
      data: {
        title: c.title,
        description: c.description,
        steps: { create: c.steps.map(s => ({ title: s.title, description: s.description, order: s.order })) },
        jobs: { create: c.jobs.map(j => ({ title: j.title, company: j.company, location: j.location, description: j.description, url: j.url })) }
      }
    });
  }

  if (process.env.SEED_DEMO_PASSWORD) {
    const bcrypt = require('bcrypt');
    const hashed = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 10);
    await prisma.user.create({
      data: {
        name: 'Demo User',
        email: 'demo@synex-academy.local',
        password: hashed,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch(e => {
    logger.error('Seed əməliyyatı zamanı xəta', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
