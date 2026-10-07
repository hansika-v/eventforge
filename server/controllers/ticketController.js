const TicketType = require('../models/TicketType');
const Event = require('../models/Event');

const getTicketTypes = async (req, res) => {
  try {
    const filter = {};
    if (req.query.event) filter.event = req.query.event;

    const tickets = await TicketType.find(filter).populate('event', 'title date').sort({ price: 1 });
    return res.json(tickets);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch ticket types' });
  }
};

const createTicketType = async (req, res) => {
  try {
    const { event, name, description, price, capacity, isFeatured } = req.body;
    if (!event || !name) return res.status(400).json({ message: 'Event and ticket name are required' });

    const eventExists = await Event.findById(event);
    if (!eventExists) return res.status(404).json({ message: 'Event not found' });

    const ticket = await TicketType.create({
      event,
      name,
      description,
      price: Number(price || 0),
      capacity: Number(capacity || 100),
      isFeatured: !!isFeatured,
    });

    return res.status(201).json(await TicketType.findById(ticket._id).populate('event', 'title date'));
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Ticket type creation failed' });
  }
};

const updateTicketType = async (req, res) => {
  try {
    const ticket = await TicketType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket type not found' });
    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Ticket type update failed' });
  }
};

const deleteTicketType = async (req, res) => {
  try {
    const ticket = await TicketType.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket type not found' });
    return res.json({ message: 'Ticket type deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Ticket type deletion failed' });
  }
};

module.exports = { getTicketTypes, createTicketType, updateTicketType, deleteTicketType };
