const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
require('dotenv').config();

const pg = neon(process.env.DATABASE_URL);
const db = drizzle({ client: pg });

async function seedSimple() {
  try {
    console.log('🌱 Seeding basic branches...');
    
    // Simple insert with only existing columns
    const branches = [
      {
        branchCode: 'CSE',
        branchName: 'Computer Science Engineering',
        description: 'Software development, algorithms, data structures, AI/ML, web development',
        subjects: JSON.stringify([
          'Programming Fundamentals', 'Data Structures', 'Algorithms', 'Database Management',
          'Operating Systems', 'Computer Networks', 'Software Engineering', 'Machine Learning'
        ])
      },
      {
        branchCode: 'ECE',
        branchName: 'Electronics & Communication Engineering',
        description: 'Electronics, communication systems, signal processing, embedded systems',
        subjects: JSON.stringify([
          'Circuit Analysis', 'Electronic Devices', 'Digital Electronics', 'Signal Processing',
          'Communication Systems', 'Microprocessors', 'Embedded Systems', 'VLSI Design'
        ])
      },
      {
        branchCode: 'MECH',
        branchName: 'Mechanical Engineering',
        description: 'Mechanics, thermodynamics, manufacturing, design, materials',
        subjects: JSON.stringify([
          'Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Heat Transfer',
          'Manufacturing Processes', 'Machine Design', 'Materials Science', 'CAD/CAM'
        ])
      },
      {
        branchCode: 'CIVIL',
        branchName: 'Civil Engineering',
        description: 'Construction, structures, transportation, environmental engineering',
        subjects: JSON.stringify([
          'Engineering Mechanics', 'Structural Analysis', 'Concrete Technology', 'Soil Mechanics',
          'Transportation Engineering', 'Water Resources', 'Environmental Engineering'
        ])
      },
      {
        branchCode: 'EEE',
        branchName: 'Electrical & Electronics Engineering',
        description: 'Power systems, control systems, electrical machines, power electronics',
        subjects: JSON.stringify([
          'Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems',
          'Power Electronics', 'Digital Signal Processing', 'Instrumentation', 'Renewable Energy'
        ])
      }
    ];
    
    for (const branch of branches) {
      try {
        await db.execute(`
          INSERT INTO engineering_branches (branch_code, branch_name, description, subjects, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (branch_code) DO UPDATE SET
            branch_name = EXCLUDED.branch_name,
            description = EXCLUDED.description,
            subjects = EXCLUDED.subjects
        `, [
          branch.branchCode,
          branch.branchName,
          branch.description,
          branch.subjects,
          new Date().toISOString()
        ]);
        console.log(`✅ Added/Updated branch: ${branch.branchName}`);
      } catch (error) {
        console.log(`❌ Error with branch ${branch.branchCode}:`, error.message);
      }
    }
    
    console.log('🎉 Basic branches seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding:', error);
  }
}

seedSimple().then(() => {
  console.log('✨ Seeding completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Seeding failed:', error);
  process.exit(1);
});