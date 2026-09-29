import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

import User from '../models/User.js';
import Analysis from '../models/Analysis.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DEMO_EMAIL = 'demo@resumely.test';
const DEMO_PASSWORD = 'Demo@1234';
const DEMO_NAME = 'Demo Student';

const strongResumeResult = {
  score: 87,
  verdict: 'Strong match',
  summary: 'Clear structure, quantified impact, and keywords well aligned with the target job description.',
  strengths: [
    'Metrics-driven bullet points (e.g. "reduced load time by 40%")',
    'Skills section matches most of the job description keywords',
    'Clean reverse-chronological format that ATS parsers handle well'
  ],
  improvements: [
    'Add a short professional summary at the top',
    'Include links to GitHub/portfolio projects'
  ],
  keywords: {
    matched: ['React', 'Node.js', 'REST API', 'MongoDB', 'Git'],
    missing: ['Docker', 'CI/CD']
  },
  sections: [
    { name: 'Contact & Header', score: 95, note: 'Complete and easy to parse.' },
    { name: 'Experience', score: 88, note: 'Quantified achievements present.' },
    { name: 'Skills', score: 82, note: 'Good coverage, a couple of tools missing.' },
    { name: 'Formatting', score: 90, note: 'Single column, ATS-friendly.' }
  ]
};

const weakResumeResult = {
  score: 46,
  verdict: 'Needs work',
  summary: 'Resume lacks measurable achievements and several key skills from the job description are missing.',
  strengths: [
    'Education section is clear',
    'No spelling errors detected'
  ],
  improvements: [
    'Add numbers/impact to each bullet point (%, $, time saved)',
    'Include a skills section with relevant keywords',
    'Avoid tables/columns that ATS software may fail to parse'
  ],
  keywords: {
    matched: ['JavaScript'],
    missing: ['React', 'Node.js', 'REST API', 'MongoDB', 'Git']
  },
  sections: [
    { name: 'Contact & Header', score: 70, note: 'Present but missing LinkedIn/portfolio.' },
    { name: 'Experience', score: 35, note: 'Duties listed without measurable outcomes.' },
    { name: 'Skills', score: 30, note: 'Very few keywords match the target role.' },
    { name: 'Formatting', score: 55, note: 'Two-column layout may confuse ATS parsers.' }
  ]
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.MONGO_DATABASE });
  console.log(`Connected to MongoDB (${process.env.MONGO_DATABASE})`);

  await Analysis.deleteMany({});
  await User.deleteMany({ email: DEMO_EMAIL });

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await User.create({ name: DEMO_NAME, email: DEMO_EMAIL, passwordHash });
  console.log(`Created demo user: ${DEMO_EMAIL}`);

  await Analysis.create([
    {
      user: user._id,
      resumeName: 'Aarav_Sharma_Resume.pdf',
      resumeText: 'Aarav Sharma - Software Engineer. Built React and Node.js applications, reduced page load time by 40%, worked with MongoDB and REST APIs.',
      jobDescription: 'Looking for a full-stack developer skilled in React, Node.js, MongoDB, Docker and CI/CD.',
      score: strongResumeResult.score,
      result: strongResumeResult,
      source: 'gemini'
    },
    {
      user: user._id,
      resumeName: 'Rahul_Resume.pdf',
      resumeText: 'Rahul Kumar - responsible for coding tasks and helping the team, used JavaScript for small projects.',
      jobDescription: 'Looking for a full-stack developer skilled in React, Node.js, MongoDB, Docker and CI/CD.',
      score: weakResumeResult.score,
      result: weakResumeResult,
      source: 'gemini'
    }
  ]);
  console.log('Created 2 sample analyses (one strong, one weak) for the dashboard demo.');

  console.log('\nDemo login credentials:');
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seeding failed:', error.message);
  process.exit(1);
});
