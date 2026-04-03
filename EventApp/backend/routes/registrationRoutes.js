const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  registerForEvent, unregisterFromEvent, getMyRegistrations, checkRegistration, getMyCertificates, downloadCertificatePDF,
} = require('../controllers/registrationController');

router.use(protect, authorize('student'));

router.post('/:eventId', registerForEvent);
router.delete('/:eventId', unregisterFromEvent);
router.get('/my', getMyRegistrations);
router.get('/check/:eventId', checkRegistration);
router.get('/certificates', getMyCertificates);
router.get('/certificates/:certId/pdf', downloadCertificatePDF);

module.exports = router;
