const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStats, createOrganizer, getUsers, updateUser, deleteUser,
  approveEvent, rejectEvent, getAllEvents,
  getDepartments, createDepartment, updateDepartment, deleteDepartment,
} = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.post('/organizers', createOrganizer);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/events', getAllEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);

router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

module.exports = router;
