const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Department = require('../models/Department');
const generateToken = require('../utils/generateToken');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const approvedEvents = await Event.countDocuments({ status: 'approved' });
    const completedEvents = await Event.countDocuments({ status: 'completed' });
    const totalRegistrations = await Registration.countDocuments();
    const attendedCount = await Registration.countDocuments({ status: 'attended' });

    // Department-wise participation (student registrations grouped by student dept)
    const deptParticipation = await Registration.aggregate([
      { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'userInfo' } },
      { $unwind: '$userInfo' },
      { $group: { _id: '$userInfo.department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Event type distribution
    const eventTypeDistribution = await Event.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Monthly event count
    const monthlyEvents = await Event.aggregate([
      { $group: { _id: { $month: '$startDate' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    // Monthly registrations count
    const monthlyRegistrations = await Registration.aggregate([
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    // Event status distribution
    const eventStatusDistribution = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Top events by registrations
    const topEvents = await Event.find()
      .sort({ currentRegistrations: -1 })
      .limit(5)
      .select('name type department currentRegistrations maxParticipants');

    // Department-wise event count
    const deptEventCount = await Event.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Registration status breakdown
    const regStatusBreakdown = await Registration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers, totalStudents, totalOrganizers, totalEvents,
      pendingEvents, approvedEvents, completedEvents, totalRegistrations, attendedCount,
      deptParticipation, eventTypeDistribution, monthlyEvents, monthlyRegistrations,
      eventStatusDistribution, topEvents, deptEventCount, regStatusBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create organizer account
// @route   POST /api/admin/organizers
const createOrganizer = async (req, res) => {
  try {
    const { name, phone, email, password, department } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const organizer = await User.create({
      name, phone, email, password, department, role: 'organizer', createdBy: req.user._id,
    });

    res.status(201).json({
      _id: organizer._id, name: organizer.name, email: organizer.email,
      role: organizer.role, department: organizer.department,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role, department, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, email, department, branch, isActive, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (department) user.department = department;
    if (branch) user.branch = branch;
    if (typeof isActive === 'boolean') user.isActive = isActive;
    if (role && ['student', 'organizer'].includes(role)) user.role = role;

    await user.save();
    res.json({ message: 'User updated', user: { _id: user._id, name: user.name, role: user.role, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve event
// @route   PUT /api/admin/events/:id/approve
const approveEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'approved';
    event.approvedBy = req.user._id;
    event.approvedAt = new Date();
    await event.save();

    res.json({ message: 'Event approved', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject event
// @route   PUT /api/admin/events/:id/reject
const rejectEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    event.status = 'rejected';
    event.rejectionReason = req.body.reason || 'Rejected by admin';
    await event.save();

    res.json({ message: 'Event rejected', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all events (admin)
// @route   GET /api/admin/events
const getAllEvents = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name department')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Department CRUD ---
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, code, branches } = req.body;
    const dept = await Department.create({ name, code, branches });
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats, createOrganizer, getUsers, updateUser, deleteUser,
  approveEvent, rejectEvent, getAllEvents,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
};
