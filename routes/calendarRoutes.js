import express from 'express';
import multer from 'multer';
import { parseExcel } from '../utils/excelParser.js'; // Your Excel parsing logic
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
          school: schoolId,
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

// ✅ Route when no schoolId is provided (for all-school/global events)
router.get('/', getEventsBySchool);

// ✅ Get events by schoolId (must come after `/` route)
router.get('/:schoolId', getEventsBySchool);

// ✅ Update event by ID
router.put('/:id', updateEvent);

// ✅ Delete event by ID
router.delete('/:id', deleteEvent);

export default router;
