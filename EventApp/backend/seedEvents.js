const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');
const Certificate = require('./models/Certificate');

dotenv.config();

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');

    // Find the organizer
    const organizer = await User.findOne({ email: 'organizer1@gmail.com' });
    if (!organizer) {
      console.error('Organizer (organizer1@gmail.com) not found! Create the organizer first.');
      process.exit(1);
    }

    // Find admin for approval
    const admin = await User.findOne({ role: 'admin' });

    console.log(`Found organizer: ${organizer.name} (${organizer.email})`);

    // Clear existing events, registrations, certificates
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await Certificate.deleteMany({});
    console.log('Cleared existing events, registrations & certificates');

    // Create sample students across departments (if they don't already exist)
    const studentData = [
      { name: 'Aarav Sharma', email: 'aarav@student.com', password: 'student', department: 'CSE', rollNumber: 'CSE101', session: '2024-2025' },
      { name: 'Priya Patel', email: 'priya@student.com', password: 'student', department: 'CSE', rollNumber: 'CSE102', session: '2024-2025' },
      { name: 'Rohit Kumar', email: 'rohit@student.com', password: 'student', department: 'CSE', rollNumber: 'CSE103', session: '2024-2025' },
      { name: 'Sneha Reddy', email: 'sneha@student.com', password: 'student', department: 'ECE', rollNumber: 'ECE101', session: '2024-2025' },
      { name: 'Vikram Singh', email: 'vikram@student.com', password: 'student', department: 'ECE', rollNumber: 'ECE102', session: '2024-2025' },
      { name: 'Ananya Gupta', email: 'ananya@student.com', password: 'student', department: 'ME', rollNumber: 'ME101', session: '2024-2025' },
      { name: 'Karthik Rajan', email: 'karthik@student.com', password: 'student', department: 'ME', rollNumber: 'ME102', session: '2024-2025' },
      { name: 'Divya Nair', email: 'divya@student.com', password: 'student', department: 'IT', rollNumber: 'IT101', session: '2024-2025' },
      { name: 'Arjun Menon', email: 'arjun@student.com', password: 'student', department: 'IT', rollNumber: 'IT102', session: '2024-2025' },
      { name: 'Meera Joshi', email: 'meera@student.com', password: 'student', department: 'MBA', rollNumber: 'MBA101', session: '2024-2025' },
      { name: 'Rahul Verma', email: 'rahul@student.com', password: 'student', department: 'CSE', rollNumber: 'CSE104', session: '2023-2024' },
      { name: 'Pooja Das', email: 'pooja@student.com', password: 'student', department: 'ECE', rollNumber: 'ECE103', session: '2023-2024' },
    ];

    // Delete seed students and recreate
    await User.deleteMany({ email: { $in: studentData.map(s => s.email) } });
    const students = [];
    for (const s of studentData) {
      const student = await User.create({ ...s, role: 'student', branch: s.department });
      students.push(student);
    }
    console.log(`${students.length} sample students created`);

    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    const events = [
      // ===================== COMPLETED EVENTS (past) =====================
      {
        name: 'CodeSprint 2025 - Speed Coding Contest',
        type: 'Technical',
        description: 'A fast-paced coding contest where participants solved 8 algorithmic problems in 3 hours. Over 80 students participated across departments.',
        department: 'CSE',
        venue: 'Computer Lab 1, Block A',
        coordinator: 'Dr. Rahul Sharma',
        coordinatorPhone: '9876543210',
        rules: 'Individual. Languages: C++, Java, Python. No internet.',
        startDate: new Date(now.getTime() - 60 * day),
        endDate: new Date(now.getTime() - 60 * day + 4 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() - 62 * day),
        maxParticipants: 100,
        currentRegistrations: 9,
        status: 'completed',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: new Date(now.getTime() - 65 * day),
      },
      {
        name: 'TechTalk - Cloud Computing & DevOps',
        type: 'Seminar',
        description: 'Industry experts from AWS and Azure shared insights on cloud architecture, CI/CD pipelines, and career paths in DevOps. Great turnout from all departments.',
        department: 'IT',
        venue: 'Auditorium, Main Building',
        coordinator: 'Prof. Divya Nair',
        coordinatorPhone: '9876543220',
        rules: 'Open to all. Certificates provided.',
        startDate: new Date(now.getTime() - 45 * day),
        endDate: new Date(now.getTime() - 45 * day + 3 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() - 47 * day),
        maxParticipants: 200,
        currentRegistrations: 10,
        status: 'completed',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: new Date(now.getTime() - 50 * day),
      },
      {
        name: 'Circuit Design Challenge',
        type: 'Technical',
        description: 'ECE students designed and demonstrated innovative circuit projects. Categories: Analog, Digital, and IoT. Top 3 projects won cash prizes.',
        department: 'ECE',
        venue: 'Electronics Lab, ECE Block',
        coordinator: 'Dr. Sneha Reddy',
        coordinatorPhone: '9876543221',
        rules: 'Teams of 2-3. Must build working prototype. 5 hours.',
        startDate: new Date(now.getTime() - 30 * day),
        endDate: new Date(now.getTime() - 30 * day + 6 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() - 33 * day),
        maxParticipants: 60,
        currentRegistrations: 8,
        status: 'completed',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: new Date(now.getTime() - 36 * day),
      },
      {
        name: 'Sportathon - Indoor Games Championship',
        type: 'Sports',
        description: 'A fun-filled day of indoor games including chess, table tennis, carrom, and badminton. Students from all departments competed enthusiastically.',
        department: 'CSE',
        venue: 'Indoor Sports Complex',
        coordinator: 'Mr. Suresh Kumar',
        coordinatorPhone: '9876543222',
        rules: 'Individual entries. College ID mandatory.',
        startDate: new Date(now.getTime() - 20 * day),
        endDate: new Date(now.getTime() - 20 * day + 8 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() - 23 * day),
        maxParticipants: 80,
        currentRegistrations: 11,
        status: 'completed',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: new Date(now.getTime() - 27 * day),
      },
      {
        name: 'Python Bootcamp for Beginners',
        type: 'Workshop',
        description: 'A 2-day intensive workshop on Python programming covering basics, data structures, file handling, and intro to data science. Great for freshers!',
        department: 'CSE',
        venue: 'Smart Classroom 2, IT Block',
        coordinator: 'Mr. Vikram Patel',
        coordinatorPhone: '9876543223',
        rules: 'Bring laptop. No prior coding experience needed.',
        startDate: new Date(now.getTime() - 15 * day),
        endDate: new Date(now.getTime() - 14 * day),
        registrationDeadline: new Date(now.getTime() - 17 * day),
        maxParticipants: 50,
        currentRegistrations: 10,
        status: 'completed',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: new Date(now.getTime() - 20 * day),
      },

      // ===================== UPCOMING APPROVED EVENTS =====================
      {
        name: 'CodeStorm - Competitive Programming Contest',
        type: 'Technical',
        description: 'A high-intensity competitive programming contest where participants solve algorithmic challenges within a time limit. Test your coding skills against the best minds on campus.',
        department: 'CSE',
        venue: 'Computer Lab 1, Block A',
        coordinator: 'Dr. Rahul Sharma',
        coordinatorPhone: '9876543210',
        rules: '1. Individual participation only\n2. Languages: C++, Java, Python\n3. Internet access not allowed\n4. 3 hours duration',
        startDate: new Date(now.getTime() + 10 * day),
        endDate: new Date(now.getTime() + 10 * day + 4 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 8 * day),
        maxParticipants: 120,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'HackFusion 2026 - 24hr Hackathon',
        type: 'Technical',
        description: 'Build innovative solutions in 24 hours! Teams of 2-4 work on real-world problem statements. Themes: HealthTech, EdTech, FinTech, Sustainability.',
        department: 'CSE',
        venue: 'Seminar Hall, Main Building',
        coordinator: 'Prof. Ananya Gupta',
        coordinatorPhone: '9876543211',
        rules: '1. Team size: 2-4 members\n2. Pre-built templates not allowed\n3. Final demo required',
        startDate: new Date(now.getTime() + 15 * day),
        endDate: new Date(now.getTime() + 16 * day),
        registrationDeadline: new Date(now.getTime() + 12 * day),
        maxParticipants: 200,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'WebDev Workshop - React & Node.js',
        type: 'Workshop',
        description: 'Hands-on 2-day workshop on full-stack web development with React.js and Node.js. Topics: hooks, Redux, REST APIs, MongoDB, auth, deployment.',
        department: 'CSE',
        venue: 'Smart Classroom 3, IT Block',
        coordinator: 'Mr. Vikram Patel',
        coordinatorPhone: '9876543212',
        rules: '1. Bring your own laptop\n2. Node.js & VS Code pre-installed\n3. Basic JS knowledge required',
        startDate: new Date(now.getTime() + 7 * day),
        endDate: new Date(now.getTime() + 8 * day),
        registrationDeadline: new Date(now.getTime() + 5 * day),
        maxParticipants: 60,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'AI/ML Seminar - Future of Generative AI',
        type: 'Seminar',
        description: 'Guest speakers from Google and Microsoft on LLMs, Diffusion Models, AI Ethics, and career opportunities.',
        department: 'CSE',
        venue: 'Auditorium, Main Building',
        coordinator: 'Dr. Priya Menon',
        coordinatorPhone: '9876543213',
        rules: '1. Open to all departments\n2. Certificates for all attendees',
        startDate: new Date(now.getTime() + 5 * day),
        endDate: new Date(now.getTime() + 5 * day + 3 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 4 * day),
        maxParticipants: 300,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'RoboWars - Robotics Competition',
        type: 'Technical',
        description: 'Build fighting robots for the arena! Lightweight (<5kg) and Heavyweight (<15kg) categories.',
        department: 'ECE',
        venue: 'Open Ground, Engineering Block',
        coordinator: 'Prof. Karthik Rajan',
        coordinatorPhone: '9876543214',
        rules: '1. Team size: 2-5\n2. Max 50x50x50 cm\n3. No flammables\n4. Wireless control',
        startDate: new Date(now.getTime() + 20 * day),
        endDate: new Date(now.getTime() + 21 * day),
        registrationDeadline: new Date(now.getTime() + 17 * day),
        maxParticipants: 50,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'Rhythms - Cultural Fest Dance Competition',
        type: 'Cultural',
        description: 'Solo, duet, and group dance. All forms welcome. Grand prizes!',
        department: 'CSE',
        venue: 'College Auditorium',
        coordinator: 'Ms. Sneha Kapoor',
        coordinatorPhone: '9876543215',
        rules: '1. Solo: 3-5 min, Duet: 4-6 min, Group: 6-10 min\n2. Submit music track 2 days prior',
        startDate: new Date(now.getTime() + 25 * day),
        endDate: new Date(now.getTime() + 25 * day + 6 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 22 * day),
        maxParticipants: 150,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'ShutterBug - Photography Contest',
        type: 'Cultural',
        description: 'Capture the world through your lens! Mobile & DSLR categories. Best entries exhibited in gallery.',
        department: 'IT',
        venue: 'Campus-wide + Art Gallery',
        coordinator: 'Mr. Arjun Nair',
        coordinatorPhone: '9876543216',
        rules: '1. Original unedited photos\n2. Max 3 submissions\n3. EXIF data intact',
        startDate: new Date(now.getTime() + 12 * day),
        endDate: new Date(now.getTime() + 12 * day + 8 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 10 * day),
        maxParticipants: 200,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },
      {
        name: 'Thunder Cup - Cricket Tournament',
        type: 'Sports',
        description: 'T10 inter-department cricket. Battle for the Thunder Cup trophy!',
        department: 'ME',
        venue: 'College Cricket Ground',
        coordinator: 'Mr. Suresh Kumar',
        coordinatorPhone: '9876543217',
        rules: '1. 11 players + 4 subs\n2. T10 format\n3. Dept teams only',
        startDate: new Date(now.getTime() + 30 * day),
        endDate: new Date(now.getTime() + 35 * day),
        registrationDeadline: new Date(now.getTime() + 25 * day),
        maxParticipants: 100,
        status: 'approved',
        createdBy: organizer._id,
        approvedBy: admin?._id,
        approvedAt: now,
      },

      // ===================== PENDING EVENTS =====================
      {
        name: 'Cybersecurity CTF Challenge',
        type: 'Technical',
        description: 'CTF with web exploitation, cryptography, reverse engineering, forensics, and OSINT.',
        department: 'CSE',
        venue: 'Network Lab, IT Block',
        coordinator: 'Dr. Amit Verma',
        coordinatorPhone: '9876543218',
        rules: '1. Teams of 1-3\n2. No attacking infra\n3. 6 hours',
        startDate: new Date(now.getTime() + 40 * day),
        endDate: new Date(now.getTime() + 40 * day + 6 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 35 * day),
        maxParticipants: 90,
        status: 'pending',
        createdBy: organizer._id,
      },
      {
        name: 'StartUp Pitch - Entrepreneurship Competition',
        type: 'Seminar',
        description: 'Pitch your startup idea to investors. Win seed funding and incubation!',
        department: 'MBA',
        venue: 'Conference Room, Admin Block',
        coordinator: 'Prof. Meera Joshi',
        coordinatorPhone: '9876543219',
        rules: '1. Team 1-4\n2. 10 min pitch + 5 min Q&A\n3. Slides mandatory',
        startDate: new Date(now.getTime() + 45 * day),
        endDate: new Date(now.getTime() + 45 * day + 8 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 40 * day),
        maxParticipants: 40,
        status: 'pending',
        createdBy: organizer._id,
      },
    ];

    const created = await Event.insertMany(events);
    console.log(`\n${created.length} events seeded successfully!`);

    const completed = created.filter(e => e.status === 'completed');
    const approved = created.filter(e => e.status === 'approved');
    const pending = created.filter(e => e.status === 'pending');
    console.log(`  - ${completed.length} completed (past events with data)`);
    console.log(`  - ${approved.length} approved (upcoming, visible to students)`);
    console.log(`  - ${pending.length} pending (need admin approval)`);

    // ===================== SEED REGISTRATIONS FOR COMPLETED EVENTS =====================
    console.log('\nSeeding registrations and attendance...');

    // Helper: pick N random students from array
    const pickRandom = (arr, n) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(n, arr.length));
    };

    // Students grouped by dept for weighted participation
    const csStudents = students.filter(s => s.department === 'CSE');  // 4 students
    const eceStudents = students.filter(s => s.department === 'ECE'); // 3 students
    const meStudents = students.filter(s => s.department === 'ME');   // 2 students
    const itStudents = students.filter(s => s.department === 'IT');   // 2 students
    const mbaStudents = students.filter(s => s.department === 'MBA'); // 1 student

    let totalRegs = 0;
    let totalAttended = 0;

    for (const event of completed) {
      // Decide which students register for this event
      let eventStudents = [];

      // CSE students participate in everything heavily
      eventStudents.push(...pickRandom(csStudents, 3 + Math.floor(Math.random() * 2)));
      // ECE students participate moderately
      eventStudents.push(...pickRandom(eceStudents, 1 + Math.floor(Math.random() * 2)));
      // ME students participate sometimes
      eventStudents.push(...pickRandom(meStudents, Math.floor(Math.random() * 2) + 1));
      // IT students participate moderately
      eventStudents.push(...pickRandom(itStudents, Math.floor(Math.random() * 2) + 1));
      // MBA students participate less in tech events
      if (event.type !== 'Technical' || Math.random() > 0.5) {
        eventStudents.push(...pickRandom(mbaStudents, 1));
      }

      // Deduplicate
      const uniqueIds = new Set();
      eventStudents = eventStudents.filter(s => {
        if (uniqueIds.has(s._id.toString())) return false;
        uniqueIds.add(s._id.toString());
        return true;
      });

      const registrations = [];
      for (const student of eventStudents) {
        // 75% attended, 15% absent, 10% cancelled
        const rand = Math.random();
        let status;
        if (rand < 0.75) status = 'attended';
        else if (rand < 0.90) status = 'absent';
        else status = 'cancelled';

        if (status === 'attended') totalAttended++;
        totalRegs++;

        registrations.push({
          event: event._id,
          user: student._id,
          status,
          registeredAt: new Date(event.startDate.getTime() - (Math.floor(Math.random() * 5) + 1) * day),
          attendanceMarkedAt: status !== 'cancelled' ? event.endDate : undefined,
          attendanceMarkedBy: status !== 'cancelled' ? organizer._id : undefined,
        });
      }

      await Registration.insertMany(registrations);
      // Update currentRegistrations count on event
      await Event.findByIdAndUpdate(event._id, { currentRegistrations: registrations.length });
      console.log(`  [${event.name}] - ${registrations.length} registrations (${registrations.filter(r => r.status === 'attended').length} attended)`);
    }

    // Also add a few registrations for upcoming approved events (just 'registered' status)
    console.log('\nSeeding registrations for upcoming events...');
    for (const event of approved.slice(0, 4)) {
      const eventStudents = pickRandom(students, 3 + Math.floor(Math.random() * 4));
      const registrations = eventStudents.map(student => ({
        event: event._id,
        user: student._id,
        status: 'registered',
        registeredAt: new Date(now.getTime() - Math.floor(Math.random() * 3) * day),
      }));
      await Registration.insertMany(registrations);
      await Event.findByIdAndUpdate(event._id, { currentRegistrations: registrations.length });
      totalRegs += registrations.length;
      console.log(`  [${event.name}] - ${registrations.length} pre-registrations`);
    }

    console.log(`\nTotal: ${totalRegs} registrations, ${totalAttended} attended`);

    console.log('\n--- Summary ---');
    console.log(`Events: ${created.length} (${completed.length} completed, ${approved.length} upcoming, ${pending.length} pending)`);
    console.log(`Students: ${students.length}`);
    console.log(`Registrations: ${totalRegs}`);

    console.log('\nEvents:');
    created.forEach(e => console.log(`  [${e.status.toUpperCase()}] ${e.name} (${e.type}) - ${e.department}`));

    console.log('\nSample student logins (password: student):');
    students.slice(0, 5).forEach(s => console.log(`  ${s.email} (${s.department})`));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
