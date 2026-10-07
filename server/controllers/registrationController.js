const Registration = require('../models/Registration');
const Event = require('../models/Event');
const TicketType = require('../models/TicketType');

const getRegistrations = async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;
    if (req.query.attendee) filter.attendee = req.query.attendee;

    const regs = await Registration.find(filter)
      .populate('event', 'title date location')
      .populate('attendee', 'name email role')
      .populate('ticketType', 'name price')
      .sort({ createdAt: -1 });

    return res.json(regs);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch registrations' });
  }
};

const getMyRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ attendee: req.user._id })
      .populate('event', 'title date location')
      .populate('ticketType', 'name price')
      .sort({ createdAt: -1 });
    return res.json(regs);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch your registrations' });
  }
};

const createRegistration = async (req, res) => {
  try {
    const { event, ticketType, selectedSessionIds = [] } = req.body;
    if (!event || !ticketType) {
      return res.status(400).json({ message: 'Event and ticket type are required' });
    }

    const eventDoc = await Event.findById(event);
    if (!eventDoc) return res.status(404).json({ message: 'Event not found' });

    const ticket = await TicketType.findById(ticketType);
    if (!ticket || ticket.event.toString() !== eventDoc._id.toString()) {
      return res.status(400).json({ message: 'Ticket type is invalid for this event' });
    }

    const existing = await Registration.findOne({ event, attendee: req.user._id, status: { $ne: 'cancelled' } });
    if (existing) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const totalRegistrations = await Registration.countDocuments({ event, status: { $ne: 'cancelled' } });
    if (eventDoc.capacity && totalRegistrations >= eventDoc.capacity) {
      return res.status(400).json({ message: 'Event capacity reached' });
    }

    const ticketCount = await Registration.countDocuments({ event, ticketType, status: { $ne: 'cancelled' } });
    if (ticket.capacity && ticketCount >= ticket.capacity) {
      return res.status(400).json({ message: 'This ticket type is sold out' });
    }

    const ticketCode = `EVF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const registration = await Registration.create({
      event,
      attendee: req.user._id,
      ticketType,
      ticketCode,
      selectedSessionIds,
      status: 'registered',
    });

    return res.status(201).json(await Registration.findById(registration._id).populate('event').populate('ticketType').populate('attendee', 'name email'));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const checkInRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('event').populate('ticketType').populate('attendee', 'name email');
    if (!registration) return res.status(404).json({ message: 'Registration not found' });
    if (registration.status === 'checked_in') {
      return res.status(400).json({ message: 'Attendee has already been checked in' });
    }

    registration.status = 'checked_in';
    await registration.save();

    return res.json(registration);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Check-in failed' });
  }
};

module.exports = { getRegistrations, getMyRegistrations, createRegistration, checkInRegistration };
