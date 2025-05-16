// controllers/schoolController.js
import School from '../models/School.js';
import Event from '../models/Event.js';
import { parseExcel } from '../utils/excelParser.js';

export const uploadAllSchoolExcel = async (req, res) => {
    try {
      const buffer = req.file.buffer;
      const allSchoolJson = parseExcel(buffer);  // Function to parse Excel file
  
      // Log the parsed data to inspect it
      console.log('Parsed All-School JSON:', allSchoolJson);
  
      if (!Array.isArray(allSchoolJson)) {
        return res.status(400).json({ message: 'Uploaded file is not valid' });
      }
  
      // Continue with saving the events to the database
      for (const row of allSchoolJson) {
        const event = new Event({
          title: row.title || row.event,  // Handle column name mismatch
          date: new Date(row.date),
          school: null,  // All-school events
        });
        await event.save();
      }
  
      res.status(200).json({ message: 'All-school events uploaded' });
    } catch (error) {
      console.error('Upload all-school Excel error:', error);
      res.status(500).json({ message: 'Failed to upload all-school events', error: error.message });
    }
  };
  

  export const createSchool = async (req, res) => {
    const { name } = req.body;
  
    // Step 1: Create the new school
    const school = new School({ name });
    await school.save();
  
    // Step 2: Get all events where school is 'null' (i.e., allschool events)
    const allEvents = await Event.find({ school: null });
  
    // Step 3: Iterate over each event and create a new event for the new school
    for (const event of allEvents) {
      // Check if an event with the same title, date, and school already exists
      const existingEvent = await Event.findOne({
        title: event.title,
        date: event.date,
        school: school._id,
      });
  
      // If no existing event, create a new event
      if (!existingEvent) {
        const newEvent = new Event({
          title: event.title,
          date: event.date,
          school: school._id,  // Associate with the new school
        });
        
        // Save the new event
        await newEvent.save();
      }
    }
  
    // Step 4: Respond with success message
    res.status(201).json({ message: 'School created and events inherited' });
  };
  
  
  

export const generateLink = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const school = await School.findById(schoolId);
    if (!school) return res.status(404).json({ msg: 'School not found' });

    const link = `${process.env.FRONTEND_URL}/school/${school._id}`;
    res.json({ link });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate link', error: error.message });
  }
};


export const getAllSchools = async (req, res) => {
  try {
    const schools = await School.find(); // Fetch all schools
    if (!schools || schools.length === 0) {
      return res.status(404).json({ message: 'No schools found' });
    }
    res.json(schools); // Return all school details
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch schools' });
  }
};
