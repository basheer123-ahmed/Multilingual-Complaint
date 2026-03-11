const express = require('express');
const { getDepartments, createDepartment } = require('../controllers/departmentController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getDepartments)
  .post(protect, admin, createDepartment);

module.exports = router;
