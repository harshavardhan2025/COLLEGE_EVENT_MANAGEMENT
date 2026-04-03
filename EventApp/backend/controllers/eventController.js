const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Certificate = require('../models/Certificate');
const { generateCertificateId } = require('../utils/helpers');
const ExcelJS = require('exceljs');

// @desc    Create event
// @route   POST /api/events
const createEvent = async (req, res) => {
  try {
    const eventData = { ...req.body, createdBy: req.user._id };
    if (req.file) {
      eventData.poster = `/uploads/${req.file.filename}`;
    }
    const event = await Event.create(eventData);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organizer's events
// @route   GET /api/events/my-events
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single event with details
// @route   GET /api/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name department phone');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.file) {
      req.body.poster = `/uploads/${req.file.filename}`;
    }

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete event (only before start)
// @route   DELETE /api/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (new Date(event.startDate) <= new Date()) {
      return res.status(400).json({ message: 'Cannot delete event that has already started' });
    }

    await Registration.deleteMany({ event: event._id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark event as completed
// @route   PUT /api/events/:id/complete
const completeEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.status = 'completed';
    await event.save();
    res.json({ message: 'Event marked as completed', event });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Browse approved events (public / student)
// @route   GET /api/events
const browseEvents = async (req, res) => {
  try {
    const { type, department, search, page = 1, limit = 20 } = req.query;
    const query = { status: 'approved' };
    if (type) query.type = type;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('createdBy', 'name department')
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get event registrations (organizer)
// @route   GET /api/events/:id/registrations
const getRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ event: req.params.id })
      .populate('user', 'name phone email department branch rollNumber');
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark attendance
// @route   PUT /api/events/:id/attendance
const markAttendance = async (req, res) => {
  try {
    const { registrations } = req.body; // [{ registrationId, status: 'attended'|'absent' }]
    const updates = registrations.map(r =>
      Registration.findByIdAndUpdate(r.registrationId, {
        status: r.status,
        attendanceMarkedAt: new Date(),
        attendanceMarkedBy: req.user._id,
      })
    );
    await Promise.all(updates);
    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export registrations to Excel
// @route   GET /api/events/:id/export
const exportRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const regs = await Registration.find({ event: req.params.id })
      .populate('user', 'name phone email department branch rollNumber');

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Registrations');

    sheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Branch', key: 'branch', width: 15 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Registered At', key: 'registeredAt', width: 20 },
    ];

    regs.forEach((r, i) => {
      sheet.addRow({
        sno: i + 1,
        name: r.user?.name,
        phone: r.user?.phone,
        email: r.user?.email,
        department: r.user?.department,
        branch: r.user?.branch,
        rollNumber: r.user?.rollNumber,
        status: r.status,
        registeredAt: r.registeredAt?.toISOString(),
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${event.name}_registrations.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate certificates
// @route   POST /api/events/:id/certificates
const generateCertificates = async (req, res) => {
  try {
    const { certificates } = req.body;
    // certificates: [{ userId, type: 'participation'|'winner'|'runner_up'|'special' }]

    const created = [];
    for (const cert of certificates) {
      const existing = await Certificate.findOne({
        event: req.params.id, user: cert.userId, type: cert.type,
      });
      if (!existing) {
        const c = await Certificate.create({
          event: req.params.id,
          user: cert.userId,
          type: cert.type,
          certificateId: generateCertificateId(),
          issuedBy: req.user._id,
        });
        created.push(c);
      }
    }

    res.status(201).json({ message: `${created.length} certificates generated`, certificates: created });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get certificates for an event
// @route   GET /api/events/:id/certificates
const getEventCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ event: req.params.id })
      .populate('user', 'name phone department')
      .populate('event', 'name type');
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEvent, getMyEvents, getEvent, updateEvent, deleteEvent, completeEvent,
  browseEvents, getRegistrations, markAttendance, exportRegistrations,
  generateCertificates, getEventCertificates,
};
