const Session = require('../models/Session');
const Event = require('../models/Event');
const Speaker = require('../models/Speaker');
const Venue = require('../models/Venue');

const hasTimeConflict = async (payload) => {
  const { event, speaker, venue, room, startTime, endTime, excludeId } = payload;
  if (!event || !startTime || !endTime) return false;

  const query = {
    event,
    _id: { $ne: excludeId || null },
    startTime: { $lt: new Date(endTime) },
    endTime: { $gt: new Date(startTime) },
  };

  const candidates = await Session.find(query);

  return candidates.some((candidate) => {
    const speakerConflict = speaker && candidate.speaker && candidate.speaker.toString() === speaker.toString();
    const venueConflict = (venue && candidate.venue && candidate.venue.toString() === venue.toString()) ||
      (room && candidate.room && candidate.room.toString() === room.toString());
    return speakerConflict || venueConflict;
  });
};

const getSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;

    const sessions = await Session.find(filter)
      .populate('event', 'title date status')
      .populate('speaker', 'name title company')
      .populate('venue', 'name city address')
      .sort({ startTime: 1 });

    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch sessions' });
  }
};

const createSession = async (req, res) => {
  try {
    const { title, description, event, speaker, venue, room, startTime, endTime, capacity } = req.body;
    if (!title || !event || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, event, start time and end time are required' });
    }

    const eventExists = await Event.findById(event);
    if (!eventExists) return res.status(404).json({ message: 'Event not found' });

    if (speaker) {
      const speakerExists = await Speaker.findById(speaker);
      if (!speakerExists) return res.status(400).json({ message: 'Selected speaker not found' });
    }

    if (venue) {
      const venueExists = await Venue.findById(venue);
      if (!venueExists) return res.status(400).json({ message: 'Selected venue not found' });
    }

    const conflict = await hasTimeConflict({ event, speaker, venue, room, startTime, endTime });
    if (conflict) {
      return res.status(400).json({ message: 'This slot conflicts with an existing session for the same speaker or venue.' });
    }

    const session = await Session.create({
      title,
      description,
      event,
      speaker: speaker || null,
      venue: venue || null,
      room,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      capacity: capacity || 80,
    });

    return res.status(201).json(await Session.findById(session._id).populate('event').populate('speaker').populate('venue'));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Session creation failed' });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const payload = { ...req.body, excludeId: session._id };
    const conflict = await hasTimeConflict(payload);
    if (conflict) {
      return res.status(400).json({ message: 'This session conflicts with a scheduled session.' });
    }

    Object.assign(session, req.body);
    if (req.body.startTime) session.startTime = new Date(req.body.startTime);
    if (req.body.endTime) session.endTime = new Date(req.body.endTime);
    await session.save();

    return res.json(await Session.findById(session._id).populate('event').populate('speaker').populate('venue'));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Session update failed' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    return res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Session deletion failed' });
  }
};

module.exports = { getSessions, createSession, updateSession, deleteSession };
