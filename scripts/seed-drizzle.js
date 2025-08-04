const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, varchar, json, integer } = require('drizzle-orm/pg-core');
require('dotenv').config();

const pg = neon(process.env.DATABASE_URL);
const db = drizzle({ client: pg });

// Define the table schema
const engineeringBranchesTable = pgTable("engineering_branches", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  branchCode: varchar('branch_code', { length: 10 }).notNull().unique(),
  branchName: varchar('branch_name', { length: 100 }).notNull(),
  description: varchar(),
  subjects: json(),
  createdAt: varchar('created_at').default('NOW()')
});

async function seedWithDrizzle() {
  try {
    console.log('🌱 Seeding with Drizzle ORM...');
    
    const branches = [
      {
        branchCode: 'CSE',
        branchName: 'Computer Science Engineering',
        description: 'Software development, algorithms, data structures, AI/ML, web development',
        subjects: [
          'Programming Fundamentals', 'Data Structures', 'Algorithms', 'Database Management',
          'Operating Systems', 'Computer Networks', 'Software Engineering', 'Machine Learning'
        ]
      },
      {
        branchCode: 'ECE',
        branchName: 'Electronics & Communication Engineering',
        description: 'Electronics, communication systems, signal processing, embedded systems',
        subjects: [
          'Circuit Analysis', 'Electronic Devices', 'Digital Electronics', 'Signal Processing',
          'Communication Systems', 'Microprocessors', 'Embedded Systems', 'VLSI Design'
        ]
      },
      {
        branchCode: 'MECH',
        branchName: 'Mechanical Engineering',
        description: 'Mechanics, thermodynamics, manufacturing, design, materials',
        subjects: [
          'Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Heat Transfer',
          'Manufacturing Processes', 'Machine Design', 'Materials Science', 'CAD/CAM'
        ]
      },
      {
        branchCode: 'CIVIL',
        branchName: 'Civil Engineering',
        description: 'Construction, structures, transportation, environmental engineering',
        subjects: [
          'Engineering Mechanics', 'Structural Analysis', 'Concrete Technology', 'Soil Mechanics',
          'Transportation Engineering', 'Water Resources', 'Environmental Engineering'
        ]
      },
      {
        branchCode: 'EEE',
        branchName: 'Electrical & Electronics Engineering',
        description: 'Power systems, control systems, electrical machines, power electronics',
        subjects: [
          'Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems',
          'Power Electronics', 'Digital Signal Processing', 'Instrumentation', 'Renewable Energy'
        ]
      }
    ];
    
    for (const branch of branches) {
      try {
        const result = await db.insert(engineeringBranchesTable).values({
          branchCode: branch.branchCode,
          branchName: branch.branchName,
          description: branch.description,
          subjects: JSON.stringify(branch.subjects),
          createdAt: new Date().toISOString()
        }).onConflictDoNothing();
        
        console.log(`✅ Added branch: ${branch.branchName}`);
      } catch (error) {
        console.log(`⚠️  Branch ${branch.branchCode} might already exist:`, error.message);
      }
    }
    
    console.log('🎉 Branches seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding:', error);
  }
}

seedWithDrizzle().then(() => {
  console.log('✨ Seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});