import Event from '../models/Event.js';
import School from '../models/School.js';

// Get all events for a specific school or for all schools
export const getEventsBySchool = async (req, res) => {
  try {
    const schoolId = req.params.schoolId;

    if (!schoolId) {
      // No schoolId provided => Return events for all schools (school: null)
      const events = await Event.find({ school: null }).sort({ date: 1 });

      const calendarEvents = events.map(event => ({
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

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID.' });
    }

    // Find the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    // Check school ownership
    if (event.school?.toString() !== school) {
      return res.status(403).json({ message: 'You can only update events for the selected school.' });
    }

    // Apply updates
    if (title) event.title = title;
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        event.date = parsedDate;
      } else {
        return res.status(400).json({ message: 'Invalid date format.' });
      }
    }

    // Save updated event
    const updatedEvent = await event.save();
    return res.status(200).json({ message: 'Event updated successfully.', event: updatedEvent });

  } catch (err) {
    console.error('Error updating event:', err);
    return res.status(500).json({ message: 'Internal server error.' });
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
