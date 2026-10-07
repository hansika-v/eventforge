const Venue = require('../models/Venue');

const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    return res.json(venues);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch venues' });
  }
};

const createVenue = async (req, res) => {
  try {
    const { name, address, city, capacity, description, amenities } = req.body;
    if (!name) return res.status(400).json({ message: 'Venue name is required' });

    const venue = await Venue.create({
      name,
      address,
      city,
      capacity: capacity || 200,
      description,
      amenities: amenities || [],
    });

    return res.status(201).json(venue);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Venue creation failed' });
  }
};

const updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    return res.json(venue);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Venue update failed' });
  }
};

const deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ message: 'Venue not found' });
    return res.json({ message: 'Venue deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Venue deletion failed' });
  }
};

module.exports = { getVenues, createVenue, updateVenue, deleteVenue };
