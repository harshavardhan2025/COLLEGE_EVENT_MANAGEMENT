const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createEvent, getMyEvents, getEvent, updateEvent, deleteEvent, completeEvent,
  browseEvents, getRegistrations, markAttendance, exportRegistrations,
  generateCertificates, getEventCertificates,
} = require('../controllers/eventController');

// Public / student browsing
router.get('/', browseEvents);
router.get('/:id', getEvent);

// Organizer routes
router.post('/', protect, authorize('organizer', 'admin'), upload.single('poster'), createEvent);
router.get('/organizer/my-events', protect, authorize('organizer', 'admin'), getMyEvents);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('poster'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.put('/:id/complete', protect, authorize('organizer', 'admin'), completeEvent);
router.get('/:id/registrations', protect, authorize('organizer', 'admin'), getRegistrations);
router.put('/:id/attendance', protect, authorize('organizer', 'admin'), markAttendance);
router.get('/:id/export', protect, authorize('organizer', 'admin'), exportRegistrations);
router.post('/:id/certificates', protect, authorize('organizer', 'admin'), generateCertificates);
router.get('/:id/certificates', protect, getEventCertificates);

module.exports = router;
