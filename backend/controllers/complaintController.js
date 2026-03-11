const Complaint = require('../models/Complaint');
const User = require('../models/User');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
const createComplaint = async (req, res) => {
  const { category, description, latitude, longitude, address, location, severity, evidenceUrls } = req.body;

  try {
    // Generate simple complain ID: COMP-timestamp
    const complaintId = `COMP-${Date.now()}`;

    // Automatic Priority Engine
    let priority = 'Medium';
    if (severity === 'high' || severity === 'critical') priority = 'High';
    if (category === 'Public Safety') priority = 'High';
    if (severity === 'critical') priority = 'Critical';

    const complaint = await Complaint.create({
      complaintId,
      citizenUserId: req.user._id,
      category,
      description,
      latitude: latitude !== undefined ? latitude : (location?.coordinates ? location.coordinates[1] : 28.6139),
      longitude: longitude !== undefined ? longitude : (location?.coordinates ? location.coordinates[0] : 77.2090),
      address: address || location?.address || '',
      evidenceUrls: evidenceUrls || [],
      priority,
      status: 'Submitted',
      statusHistory: [{ status: 'Submitted', remarks: 'Complaint submitted by citizen' }]
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (Admin/Officer)
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'OFFICER') {
      query.assignedOfficerUserId = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('citizenUserId', 'name email phone')
      .populate('assignedOfficerUserId', 'name')
      .populate('assignedDepartmentId', 'name')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizenUserId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenUserId', 'name email phone')
      .populate('assignedOfficerUserId', 'name')
      .populate('assignedDepartmentId', 'name');

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id
// @access  Private (Officer/Admin)
const updateComplaintStatus = async (req, res) => {
  const { status, remarks } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Validate status transitions if needed
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      remarks,
      updatedBy: req.user._id
    });

    if (remarks) {
      complaint.remarks.push({
        officer: req.user._id,
        message: remarks
      });
    }

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get hotspots (Geospatial)
// @route   GET /api/complaints/hotspots
// @access  Private (Admin)
const getHotspots = async (req, res) => {
  try {
    // Simple hotspot detection logic: count complaints in groups
    const hotspots = await Complaint.aggregate([
      {
        $group: {
          _id: {
            lat: { $round: ['$latitude', 2] },
            lng: { $round: ['$longitude', 2] }
          },
          count: { $sum: 1 },
          complaints: { $push: '$_id' }
        }
      },
      { $match: { count: { $gte: 3 } } }, // Hotspot if 3+ complaints in same vicinity
      { $sort: { count: -1 } }
    ]);
    res.json(hotspots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Rate an officer's performance on a complaint
// @route   PUT /api/complaints/:id/rate
// @access  Private (Citizen)
const rateComplaint = async (req, res) => {
  const { rating, feedback } = req.body;

  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    
    // Check if user is the one who submitted the complaint
    if (complaint.citizenUserId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to rate this complaint' });
    }

    // Only resolved complaints can be rated
    if (complaint.status !== 'Resolved' && complaint.status !== 'Closed') {
      return res.status(400).json({ message: 'Only resolved complaints can be rated' });
    }

    complaint.rating = rating;
    complaint.feedback = feedback;

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get assigned complaints for officer
// @route   GET /api/complaints/assigned
// @access  Private (Officer)
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficerUserId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const GeneralFeedback = require('../models/GeneralFeedback');

// @desc    Submit general platform feedback
// @route   POST /api/complaints/platform-feedback
// @access  Private
const submitGeneralFeedback = async (req, res) => {
  try {
    const { rating, factors, remarks } = req.body;
    const feedback = await GeneralFeedback.create({
      userId: req.user._id,
      rating,
      factors,
      remarks
    });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all general feedbacks
// @route   GET /api/complaints/platform-feedback
// @access  Private
const getGeneralFeedbacks = async (req, res) => {
  try {
    const feedbacks = await GeneralFeedback.find()
      .populate('userId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  getHotspots,
  rateComplaint,
  getAssignedComplaints,
  submitGeneralFeedback,
  getGeneralFeedbacks
};
