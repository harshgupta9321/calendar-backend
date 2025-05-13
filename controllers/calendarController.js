// controllers/calendarController.js
import Event from '../models/Event.js';
import School from '../models/School.js';

// Get all events for a specific school or for all schools
export const getEventsBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId || null;

    // Case: No schoolId provided => Return events for all schools (school: null)
    if (!schoolId) {
      const events = await Event.find({ school: null }).sort({ date: 1 });

      const calendarEvents = events.map(event => ({
        title: event.title,
        start: event.date,
        school: null,
        allDay: true,
      }));

      return res.json({ events: calendarEvents });
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
      title: event.title,
      start: event.date,
      school: school.name,
      allDay: true,
    }));

    res.json({ events: calendarEvents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to get events' });
  }
};


// Update an event by ID
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ message: 'Event updated', event: updatedEvent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
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
