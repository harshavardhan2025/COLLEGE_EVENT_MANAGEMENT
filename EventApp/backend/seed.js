const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});

    // Create departments
    const departments = await Department.insertMany([
      { name: 'Computer Science', code: 'CSE', branches: ['CSE', 'AI/ML', 'Data Science'] },
      { name: 'Electronics', code: 'ECE', branches: ['ECE', 'EEE'] },
      { name: 'Mechanical', code: 'ME', branches: ['ME', 'Civil'] },
      { name: 'Information Technology', code: 'IT', branches: ['IT'] },
      { name: 'Business Administration', code: 'MBA', branches: ['MBA', 'BBA'] },
    ]);
    console.log('Departments seeded');

    // Create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin',
      role: 'admin',
      department: 'Computer Science',
    });
    console.log('Admin created - Email: admin@gmail.com, Password: admin');

    console.log('\nSeeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
