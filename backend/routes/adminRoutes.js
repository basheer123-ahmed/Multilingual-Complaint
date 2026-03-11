const express = require('express');
const { 
  assignComplaint, 
  getDashboardAnalytics, 
  getOfficers,
  updateOfficerDepartment
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.put('/assign/:id', protect, admin, assignComplaint);
router.get('/analytics', protect, admin, getDashboardAnalytics);
router.get('/officers', protect, admin, getOfficers);
router.put('/officer/:id/department', protect, admin, updateOfficerDepartment);

module.exports = router;
