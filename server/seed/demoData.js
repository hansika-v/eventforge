const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Venue = require('../models/Venue');
const Speaker = require('../models/Speaker');
const Event = require('../models/Event');
const Session = require('../models/Session');
const TicketType = require('../models/TicketType');

const seedDemoData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) return;

    const organizer = await User.create({
      name: 'Ava Morgan',
      email: 'organizer@eventforge.com',
      password: await bcrypt.hash('123456', 10),
      role: 'organizer',
      company: 'EventForge Labs',
      phone: '+1 555 010 2000',
      profile: { location: 'New York', bio: 'Builds high-impact event experiences' },
      preferences: { interests: ['Business', 'AI', 'Leadership'], notifications: true },
    });

    const staff = await User.create({
      name: 'Marcus Lee',
      email: 'staff@eventforge.com',
      password: await bcrypt.hash('123456', 10),
      role: 'staff',
      company: 'EventForge Ops',
      phone: '+1 555 010 2001',
      profile: { location: 'Chicago', bio: 'Event operations and check-in lead' },
      preferences: { interests: ['Operations'], notifications: true },
    });

    const attendee = await User.create({
      name: 'Riya Patel',
      email: 'attendee@eventforge.com',
      password: await bcrypt.hash('123456', 10),
      role: 'attendee',
      company: 'Northwind Consulting',
      phone: '+1 555 010 2002',
      profile: { location: 'Austin', bio: 'Looking to learn and network' },
      preferences: { interests: ['Networking', 'AI', 'Leadership'], notifications: true },
    });

    const venue = await Venue.create({
      name: 'Harbor Hall',
      address: '1200 Skyline Avenue',
      city: 'New York',
      capacity: 350,
      description: 'Grand convention hall with hybrid presentation support',
      amenities: ['Stage', 'Wi-Fi', 'Recording Booth'],
    });

    const speakerOne = await Speaker.create({
      name: 'Dr. Samira Khan',
      title: 'Head of AI Product',
      company: 'Northstar Labs',
      bio: 'Leads product strategy for enterprise AI experiences.',
      expertise: ['AI', 'Leadership', 'Product'],
      photo: '',
    });

    const speakerTwo = await Speaker.create({
      name: 'Ethan Brooks',
      title: 'Event Experience Strategist',
      company: 'GatherWorks',
      bio: 'Designs compelling experiences for global teams.',
      expertise: ['UX', 'Events', 'Operations'],
      photo: '',
    });

    const event = await Event.create({
      title: 'Future of Work Summit 2026',
      description: 'A one-day summit for leaders building smarter, healthier work systems.',
      category: 'Conference',
      status: 'published',
      date: new Date('2026-11-12T09:00:00Z'),
      endDate: new Date('2026-11-12T18:00:00Z'),
      location: 'New York',
      venue: venue._id,
      organizer: organizer._id,
      capacity: 300,
      imageUrl: '',
    });

    const sessionOne = await Session.create({
      title: 'AI in Everyday Operations',
      description: 'Practical applications for AI in team workflows.',
      event: event._id,
      speaker: speakerOne._id,
      venue: venue._id,
      room: 'Main Stage',
      startTime: new Date('2026-11-12T10:00:00Z'),
      endTime: new Date('2026-11-12T11:00:00Z'),
      capacity: 120,
    });

    const sessionTwo = await Session.create({
      title: 'Designing Memorable Events',
      description: 'How event teams create excellent attendee experiences.',
      event: event._id,
      speaker: speakerTwo._id,
      venue: venue._id,
      room: 'Innovation Lab',
      startTime: new Date('2026-11-12T11:30:00Z'),
      endTime: new Date('2026-11-12T12:30:00Z'),
      capacity: 80,
    });

    await TicketType.create({
      event: event._id,
      name: 'Early Bird',
      description: 'Access to keynote and expo',
      price: 149,
      capacity: 80,
      isFeatured: true,
    });

    await TicketType.create({
      event: event._id,
      name: 'VIP',
      description: 'VIP lounge + speaker roundtable',
      price: 299,
      capacity: 30,
      isFeatured: true,
    });

    await TicketType.create({
      event: event._id,
      name: 'Standard',
      description: 'Full event access',
      price: 199,
      capacity: 200,
      isFeatured: false,
    });

    const ticket = await TicketType.findOne({ event: event._id, name: 'Standard' });
    const ticketCode = `EVF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await require('../models/Registration').create({
      event: event._id,
      attendee: attendee._id,
      ticketType: ticket._id,
      ticketCode,
      selectedSessionIds: [sessionOne._id, sessionTwo._id],
      status: 'registered',
    });

    console.log('Demo data loaded');
  } catch (error) {
    console.error('Demo seed failed:', error.message);
  }
};

module.exports = { seedDemoData };
