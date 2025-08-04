import { db } from '../config/db.jsx';
import { engineeringBranchesTable, branchSubjectsTable } from '../config/schema.js';

const branches = [
  {
    branchCode: 'CSE',
    branchName: 'Computer Science Engineering',
    description: 'Software development, algorithms, data structures, AI/ML, web development',
    subjects: [
      'Programming Fundamentals', 'Data Structures', 'Algorithms', 'Database Management',
      'Operating Systems', 'Computer Networks', 'Software Engineering', 'Machine Learning',
      'Web Development', 'Mobile App Development', 'Cybersecurity', 'Cloud Computing'
    ],
    toolsAvailable: ['IDE', 'Algorithm Visualizer', 'Database Designer', 'System Design Canvas']
  },
  {
    branchCode: 'ECE',
    branchName: 'Electronics & Communication Engineering',
    description: 'Electronics, communication systems, signal processing, embedded systems',
    subjects: [
      'Circuit Analysis', 'Electronic Devices', 'Digital Electronics', 'Signal Processing',
      'Communication Systems', 'Microprocessors', 'Embedded Systems', 'VLSI Design',
      'Antenna Theory', 'Control Systems', 'Power Electronics', 'RF Engineering'
    ],
    toolsAvailable: ['Circuit Simulator', 'Signal Processing Lab', 'Microcontroller Emulator']
  },
  {
    branchCode: 'MECH',
    branchName: 'Mechanical Engineering',
    description: 'Mechanics, thermodynamics, manufacturing, design, materials',
    subjects: [
      'Engineering Mechanics', 'Thermodynamics', 'Fluid Mechanics', 'Heat Transfer',
      'Manufacturing Processes', 'Machine Design', 'Materials Science', 'CAD/CAM',
      'Automotive Engineering', 'Robotics', 'Industrial Engineering', 'Quality Control'
    ],
    toolsAvailable: ['Thermodynamics Calculator', 'Material Database', 'CAD Viewer']
  },
  {
    branchCode: 'CIVIL',
    branchName: 'Civil Engineering',
    description: 'Construction, structures, transportation, environmental engineering',
    subjects: [
      'Engineering Mechanics', 'Structural Analysis', 'Concrete Technology', 'Soil Mechanics',
      'Transportation Engineering', 'Water Resources', 'Environmental Engineering', 'Construction Management',
      'Earthquake Engineering', 'Highway Engineering', 'Building Planning', 'Surveying'
    ],
    toolsAvailable: ['Structural Analysis', 'Surveying Calculator', 'Construction Planner']
  },
  {
    branchCode: 'EEE',
    branchName: 'Electrical & Electronics Engineering',
    description: 'Power systems, control systems, electrical machines, power electronics',
    subjects: [
      'Circuit Theory', 'Electrical Machines', 'Power Systems', 'Control Systems',
      'Power Electronics', 'Digital Signal Processing', 'Instrumentation', 'Renewable Energy',
      'High Voltage Engineering', 'Electric Drives', 'Power Quality', 'Smart Grid'
    ],
    toolsAvailable: ['Circuit Simulator', 'Power System Analyzer', 'Control System Designer']
  }
];

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

async function seedBranches() {
  try {
    console.log('Seeding engineering branches...');
    
    // Insert branches
    for (const branch of branches) {
      await db.insert(engineeringBranchesTable).values({
        branchCode: branch.branchCode,
        branchName: branch.branchName,
        description: branch.description,
        subjects: JSON.stringify(branch.subjects),
        toolsAvailable: JSON.stringify(branch.toolsAvailable),
        createdAt: new Date().toISOString()
      }).onConflictDoNothing();
    }
    
    // Insert subjects
    for (const subject of subjects) {
      await db.insert(branchSubjectsTable).values({
        branchCode: subject.branchCode,
        subjectCode: subject.subjectCode,
        subjectName: subject.subjectName,
        semester: subject.semester,
        credits: subject.credits,
        isCore: subject.isCore,
        prerequisites: JSON.stringify([]),
        syllabus: JSON.stringify({})
      }).onConflictDoNothing();
    }
    
    console.log('✅ Engineering branches and subjects seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding branches:', error);
  }
}

// Run the seeding function
seedBranches();