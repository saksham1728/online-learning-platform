const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, varchar, json, integer, boolean } = require('drizzle-orm/pg-core');
require('dotenv').config();

const pg = neon(process.env.DATABASE_URL);
const db = drizzle({ client: pg });

// Define the table schema
const branchSubjectsTable = pgTable("branch_subjects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  branchCode: varchar('branch_code', { length: 10 }).notNull(),
  subjectCode: varchar('subject_code', { length: 20 }).notNull(),
  subjectName: varchar('subject_name', { length: 200 }).notNull(),
  semester: integer().notNull(),
  credits: integer().default(3),
  isCore: boolean().default(true),
  prerequisites: json(),
  syllabus: json()
});

const subjects = [
  // CSE Subjects
  { branchCode: 'CSE', subjectCode: 'CS101', subjectName: 'Programming Fundamentals', semester: 1, credits: 4, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS201', subjectName: 'Data Structures', semester: 2, credits: 4, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS301', subjectName: 'Algorithms', semester: 3, credits: 4, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS401', subjectName: 'Database Management', semester: 4, credits: 3, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS501', subjectName: 'Operating Systems', semester: 5, credits: 4, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS601', subjectName: 'Computer Networks', semester: 6, credits: 3, isCore: true },
  { branchCode: 'CSE', subjectCode: 'CS701', subjectName: 'Machine Learning', semester: 7, credits: 3, isCore: false },
  { branchCode: 'CSE', subjectCode: 'CS801', subjectName: 'Software Engineering', semester: 8, credits: 3, isCore: true },
  
  // ECE Subjects
  { branchCode: 'ECE', subjectCode: 'EC101', subjectName: 'Circuit Analysis', semester: 1, credits: 4, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC201', subjectName: 'Electronic Devices', semester: 2, credits: 4, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC301', subjectName: 'Digital Electronics', semester: 3, credits: 4, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC401', subjectName: 'Signal Processing', semester: 4, credits: 3, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC501', subjectName: 'Communication Systems', semester: 5, credits: 4, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC601', subjectName: 'Microprocessors', semester: 6, credits: 3, isCore: true },
  { branchCode: 'ECE', subjectCode: 'EC701', subjectName: 'VLSI Design', semester: 7, credits: 3, isCore: false },
  { branchCode: 'ECE', subjectCode: 'EC801', subjectName: 'Embedded Systems', semester: 8, credits: 3, isCore: true },
  
  // MECH Subjects
  { branchCode: 'MECH', subjectCode: 'ME101', subjectName: 'Engineering Mechanics', semester: 1, credits: 4, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME201', subjectName: 'Thermodynamics', semester: 2, credits: 4, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME301', subjectName: 'Fluid Mechanics', semester: 3, credits: 4, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME401', subjectName: 'Heat Transfer', semester: 4, credits: 3, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME501', subjectName: 'Manufacturing Processes', semester: 5, credits: 4, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME601', subjectName: 'Machine Design', semester: 6, credits: 3, isCore: true },
  { branchCode: 'MECH', subjectCode: 'ME701', subjectName: 'Automotive Engineering', semester: 7, credits: 3, isCore: false },
  { branchCode: 'MECH', subjectCode: 'ME801', subjectName: 'Industrial Engineering', semester: 8, credits: 3, isCore: true },
  
  // CIVIL Subjects
  { branchCode: 'CIVIL', subjectCode: 'CE101', subjectName: 'Engineering Mechanics', semester: 1, credits: 4, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE201', subjectName: 'Structural Analysis', semester: 2, credits: 4, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE301', subjectName: 'Concrete Technology', semester: 3, credits: 4, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE401', subjectName: 'Soil Mechanics', semester: 4, credits: 3, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE501', subjectName: 'Transportation Engineering', semester: 5, credits: 4, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE601', subjectName: 'Water Resources', semester: 6, credits: 3, isCore: true },
  { branchCode: 'CIVIL', subjectCode: 'CE701', subjectName: 'Environmental Engineering', semester: 7, credits: 3, isCore: false },
  { branchCode: 'CIVIL', subjectCode: 'CE801', subjectName: 'Construction Management', semester: 8, credits: 3, isCore: true },
  
  // EEE Subjects
  { branchCode: 'EEE', subjectCode: 'EE101', subjectName: 'Circuit Theory', semester: 1, credits: 4, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE201', subjectName: 'Electrical Machines', semester: 2, credits: 4, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE301', subjectName: 'Power Systems', semester: 3, credits: 4, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE401', subjectName: 'Control Systems', semester: 4, credits: 3, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE501', subjectName: 'Power Electronics', semester: 5, credits: 4, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE601', subjectName: 'Instrumentation', semester: 6, credits: 3, isCore: true },
  { branchCode: 'EEE', subjectCode: 'EE701', subjectName: 'Renewable Energy', semester: 7, credits: 3, isCore: false },
  { branchCode: 'EEE', subjectCode: 'EE801', subjectName: 'Smart Grid', semester: 8, credits: 3, isCore: true }
];

async function seedSubjects() {
  try {
    console.log('🌱 Seeding branch subjects...');
    
    for (const subject of subjects) {
      try {
        const result = await db.insert(branchSubjectsTable).values({
          branchCode: subject.branchCode,
          subjectCode: subject.subjectCode,
          subjectName: subject.subjectName,
          semester: subject.semester,
          credits: subject.credits,
          isCore: subject.isCore,
          prerequisites: JSON.stringify([]),
          syllabus: JSON.stringify({})
        }).onConflictDoNothing();
        
        console.log(`✅ Added subject: ${subject.subjectName} (${subject.subjectCode})`);
      } catch (error) {
        console.log(`⚠️  Subject ${subject.subjectCode} might already exist:`, error.message);
      }
    }
    
    console.log('🎉 Subjects seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding subjects:', error);
  }
}

seedSubjects().then(() => {
  console.log('✨ Subject seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Subject seeding failed:', error);
  process.exit(1);
});