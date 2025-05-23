  import Event from '../models/Event.js';
  import School from '../models/School.js';
  import mongoose from 'mongoose';

  // Get all events for a specific school or for all schools
  export const getEventsBySchool = async (req, res) => {
    try {
      const schoolId = req.params.schoolId;

      if (!schoolId) {
        // No schoolId provided => Return events for all schools (school: null)
        const events = await Event.find({ school: null }).sort({ date: 1 });

        const calendarEvents = events.map(event => ({
          id:event._id,
          title: event.title,
          date: event.date,
          school: null,
          allDay: true,
        }));

        return res.json(calendarEvents);
      }

      // Validate schoolId
      const school = await School.findById(schoolId);
      if (!school) {
        return res.status(404).json({ message: 'School not found' });
      }

      // Find events for the specific school
      const events = await Event.find({ school: schoolId }).sort({ date: 1 });

      if (!events || events.length === 0) {
        return res.status(404).json({ message: 'No events found for this school' });
      }

      const calendarEvents = events.map(event => ({
        id:event._id,
        title: event.title,
        date: event.date,
        school: school.name,
        allDay: true,
      }));

      res.json(calendarEvents);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to get events' });
    }
  };

  // Update an event by ID
  export const updateEvent = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, date, school } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid event ID.' });
      }
      if (!title || !date || !school) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      if (!mongoose.Types.ObjectId.isValid(school)) {
        return res.status(400).json({ message: 'Invalid school ID.' });
      }

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found.' });
      }

      if (event.school?.toString() !== school) {
        return res.status(403).json({ message: 'Event school mismatch.' });
      }

      const eventDate = new Date(date);
      if (isNaN(eventDate)) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
      eventDate.setHours(0, 0, 0, 0);

      event.title = title;
      event.date = eventDate;

      const updated = await event.save();

      res.status(200).json({ message: 'Event updated successfully.', event: updated });
    } catch (err) {
      console.error('Error updating event:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };


  //create event
  export const createEvent = async (req, res) => {
    try {
      const { title, date, school } = req.body;

      if (!title || !date || !school) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Validate school ID and existence
      if (!mongoose.Types.ObjectId.isValid(school)) {
        return res.status(400).json({ message: 'Invalid school ID.' });
      }
      const schoolExists = await School.findById(school);
      if (!schoolExists) {
        return res.status(404).json({ message: 'School not found' });
      }

      const eventDate = new Date(date);
      if (isNaN(eventDate)) {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
      eventDate.setHours(0, 0, 0, 0);

      // Check if event already exists for school on that date
      const existingEvent = await Event.findOne({
        school,
        date: {
          $gte: eventDate,
          $lt: new Date(eventDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (existingEvent) {
        return res.status(409).json({ message: 'Event already exists on this date for this school.' });
      }

      const newEvent = new Event({ title, date: eventDate, school });
      const saved = await newEvent.save();

      res.status(201).json({ message: 'Event created successfully.', event: saved });
    } catch (err) {
      console.error('Error creating event:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };



  // Delete an event by ID
  export const deleteEvent = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedEvent = await Event.findByIdAndDelete(id);

      if (!deletedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }

      res.json({ message: 'Event deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  };
