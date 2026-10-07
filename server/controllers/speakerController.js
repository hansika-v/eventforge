const Speaker = require('../models/Speaker');

const getSpeakers = async (req, res) => {
  try {
    const speakers = await Speaker.find().sort({ createdAt: -1 });
    return res.json(speakers);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch speakers' });
  }
};

const createSpeaker = async (req, res) => {
  try {
    const { name, title, company, bio, expertise, photo } = req.body;
    if (!name) return res.status(400).json({ message: 'Speaker name is required' });

    const speaker = await Speaker.create({ name, title, company, bio, expertise: expertise || [], photo });
    return res.status(201).json(speaker);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Speaker creation failed' });
  }
};

const updateSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    return res.json(speaker);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Speaker update failed' });
  }
};

const deleteSpeaker = async (req, res) => {
  try {
    const speaker = await Speaker.findByIdAndDelete(req.params.id);
    if (!speaker) return res.status(404).json({ message: 'Speaker not found' });
    return res.json({ message: 'Speaker deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Speaker deletion failed' });
  }
};

module.exports = { getSpeakers, createSpeaker, updateSpeaker, deleteSpeaker };
