// routes/calendarRoutes.js
import express from 'express';
import multer from 'multer';
import { parseExcel } from '../utils/excelParser.js'; // Assuming this is where your Excel parsing logic resides
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { checkRole } from '../middlewares/roleMiddleware.js';
import Event from '../models/Event.js';
import School from '../models/School.js';
import {
  getEventsBySchool,
  updateEvent,
  deleteEvent
} from '../controllers/calendarController.js';

const router = express.Router();

// Use memory storage for file upload (Excel)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Upload Excel and save events
router.post(
  '/upload',
  authMiddleware,
  checkRole(['admin', 'manager']),
  upload.single('file'),
  async (req, res) => {
    try {
      const buffer = req.file.buffer;
      const events = parseExcel(buffer);
      console.log('Parsed Events:', events);

      // Loop through the parsed events and save them
      for (const event of events) {
        const { date, title, school } = event;
        console.log('School in row:', school);

        let schoolId = null;

        if (school.toLowerCase() !== 'allschool') {
          const schoolDoc = await School.findOne({ name: school });
          if (!schoolDoc) {
            return res.status(400).json({ message: `School not found: ${school}` });
          }
          schoolId = schoolDoc._id;
        }

        const newEvent = new Event({
          title,
          date: new Date(date),
          school: schoolId, // null if 'allschool'
        });

        await newEvent.save();
      }

      res.status(200).json({ message: 'Events uploaded successfully' });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'Failed to upload events', error: err.message });
    }
  }
);

// ✅ Get events by school
router.get('/:schoolId', getEventsBySchool);

// Route when no schoolId is provided (for all-school/global events)
router.get('/', getEventsBySchool);
// ✅ Update event by ID
router.put('/:id', authMiddleware, updateEvent);

// ✅ Delete event by ID
router.delete('/:id', authMiddleware, deleteEvent);

export default router;
