const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// @desc    Register for event
// @route   POST /api/registrations/:eventId
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'Event is not approved yet' });
    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }
    if (event.currentRegistrations >= event.maxParticipants) {
      return res.status(400).json({ message: 'Event is full' });
    }

    const existing = await Registration.findOne({ event: req.params.eventId, user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Already registered' });

    const reg = await Registration.create({ event: req.params.eventId, user: req.user._id });

    event.currentRegistrations += 1;
    await event.save();

    res.status(201).json(reg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unregister from event
// @route   DELETE /api/registrations/:eventId
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (new Date(event.startDate) <= new Date()) {
      return res.status(400).json({ message: 'Cannot unregister after event has started' });
    }

    const reg = await Registration.findOneAndDelete({ event: req.params.eventId, user: req.user._id });
    if (!reg) return res.status(404).json({ message: 'Registration not found' });

    event.currentRegistrations = Math.max(0, event.currentRegistrations - 1);
    await event.save();

    res.json({ message: 'Unregistered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my registrations
// @route   GET /api/registrations/my
const getMyRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ user: req.user._id })
      .populate({
        path: 'event',
        populate: { path: 'createdBy', select: 'name department' },
      })
      .sort({ registeredAt: -1 });
    res.json(regs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if registered for event
// @route   GET /api/registrations/check/:eventId
const checkRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOne({ event: req.params.eventId, user: req.user._id });
    res.json({ registered: !!reg, registration: reg });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my certificates
// @route   GET /api/registrations/certificates
const getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .populate('event', 'name type startDate department')
      .sort({ issuedAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download certificate as PDF
// @route   GET /api/registrations/certificates/:certId/pdf
const downloadCertificatePDF = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certId)
      .populate('event', 'name type startDate endDate department venue')
      .populate('user', 'name email rollNumber department branch')
      .populate('issuedBy', 'name');

    if (!cert) return res.status(404).json({ message: 'Certificate not found' });
    if (cert.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${cert.certificateId}.pdf`);
    doc.pipe(res);

    const pageW = doc.page.width;
    const pageH = doc.page.height;

    // Decorative border
    doc.lineWidth(3)
      .rect(20, 20, pageW - 40, pageH - 40)
      .stroke('#4f46e5');
    doc.lineWidth(1)
      .rect(28, 28, pageW - 56, pageH - 56)
      .stroke('#a5b4fc');

    // Header decorative line
    doc.moveTo(100, 80).lineTo(pageW - 100, 80).lineWidth(2).stroke('#4f46e5');

    // Title
    doc.fontSize(14).fillColor('#64748b').font('Helvetica')
      .text('EVENT MANAGEMENT SYSTEM', 0, 55, { align: 'center' });

    doc.fontSize(36).fillColor('#4f46e5').font('Helvetica-Bold')
      .text('CERTIFICATE', 0, 95, { align: 'center' });

    // Certificate type
    const typeLabel = cert.type === 'winner' ? 'OF ACHIEVEMENT - WINNER'
      : cert.type === 'runner_up' ? 'OF ACHIEVEMENT - RUNNER UP'
      : cert.type === 'special' ? 'OF SPECIAL RECOGNITION'
      : 'OF PARTICIPATION';

    doc.fontSize(16).fillColor('#334155').font('Helvetica')
      .text(typeLabel, 0, 140, { align: 'center' });

    // Decorative line under type
    doc.moveTo(250, 168).lineTo(pageW - 250, 168).lineWidth(1).stroke('#c7d2fe');

    // "This is to certify that"
    doc.fontSize(13).fillColor('#64748b').font('Helvetica')
      .text('This is to certify that', 0, 185, { align: 'center' });

    // Student Name
    doc.fontSize(28).fillColor('#1e293b').font('Helvetica-Bold')
      .text(cert.user.name, 0, 210, { align: 'center' });

    // Underline for name
    const nameWidth = doc.widthOfString(cert.user.name);
    const nameX = (pageW - nameWidth) / 2;
    doc.moveTo(nameX, 245).lineTo(nameX + nameWidth, 245).lineWidth(1).stroke('#4f46e5');

    // Details text
    if (cert.user.rollNumber) {
      doc.fontSize(11).fillColor('#64748b').font('Helvetica')
        .text(`Roll No: ${cert.user.rollNumber}  |  ${cert.user.department || ''} - ${cert.user.branch || ''}`, 0, 255, { align: 'center' });
    }

    // Event participation text
    const actionText = cert.type === 'winner' ? 'has won'
      : cert.type === 'runner_up' ? 'has been runner up in'
      : cert.type === 'special' ? 'has received special recognition in'
      : 'has successfully participated in';

    doc.fontSize(13).fillColor('#334155').font('Helvetica')
      .text(actionText, 0, 280, { align: 'center' });

    // Event Name
    doc.fontSize(22).fillColor('#4f46e5').font('Helvetica-Bold')
      .text(cert.event.name, 0, 305, { align: 'center' });

    // Event details
    const startDate = new Date(cert.event.startDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
    const endDate = new Date(cert.event.endDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    doc.fontSize(11).fillColor('#64748b').font('Helvetica')
      .text(`${cert.event.type} Event  |  ${cert.event.department}`, 0, 340, { align: 'center' });

    doc.fontSize(11).fillColor('#64748b').font('Helvetica')
      .text(`Held on ${startDate}${startDate !== endDate ? ` to ${endDate}` : ''}  |  Venue: ${cert.event.venue}`, 0, 358, { align: 'center' });

    // Decorative line
    doc.moveTo(150, 390).lineTo(pageW - 150, 390).lineWidth(1).stroke('#e2e8f0');

    // Issued info
    const issuedDate = new Date(cert.issuedAt).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
      .text(`Issued on: ${issuedDate}`, 80, 410);

    doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
      .text(`Issued by: ${cert.issuedBy?.name || 'Organizer'}`, 80, 426);

    // Certificate ID on right
    doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
      .text(`Certificate ID: ${cert.certificateId}`, pageW - 280, 410, { width: 200, align: 'right' });

    // Bottom decorative line
    doc.moveTo(100, pageH - 60).lineTo(pageW - 100, pageH - 60).lineWidth(2).stroke('#4f46e5');

    doc.fontSize(9).fillColor('#c7d2fe').font('Helvetica')
      .text('This is a computer-generated certificate and does not require a physical signature.', 0, pageH - 50, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerForEvent, unregisterFromEvent, getMyRegistrations, checkRegistration, getMyCertificates, downloadCertificatePDF };
