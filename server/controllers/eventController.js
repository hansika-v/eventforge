const Event = require('../models/Event');
const Venue = require('../models/Venue');
const User = require('../models/User');

const populateEvent = (query) =>
  query.populate('organizer', 'name email role').populate('venue', 'name city address capacity');

const getEvents = async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.organizer) query.organizer = req.query.organizer;
    const events = await populateEvent(Event.find(query).sort({ date: 1 }));
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch events' });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await populateEvent(Event.findById(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.json(event);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch event' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, endDate, location, venue, capacity, status, imageUrl } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    if (venue) {
      const venueExists = await Venue.findById(venue);
      if (!venueExists) {
        return res.status(400).json({ message: 'Selected venue not found' });
      }
    }

    const event = await Event.create({
      title,
      description,
      category: category || 'Conference',
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location: location || 'Hybrid',
      venue: venue || null,
      organizer: req.user._id,
      capacity: capacity || 200,
      status: status || 'published',
      imageUrl: imageUrl || '',
    });

    return res.status(201).json(await populateEvent(Event.findById(event._id)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Event creation failed' });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== event.organizer.toString()) {
      return res.status(403).json({ message: 'Not allowed to update this event' });
    }

    Object.assign(event, req.body);
    if (req.body.date) event.date = new Date(req.body.date);
    if (req.body.endDate) event.endDate = new Date(req.body.endDate);
    await event.save();

    return res.json(await populateEvent(Event.findById(event._id)));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Event update failed' });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (req.user.role !== 'admin' && req.user._id.toString() !== event.organizer.toString()) {
      return res.status(403).json({ message: 'Not allowed to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Event deletion failed' });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
