const demoAccountEmails = new Set([
  'organizer@eventforge.com',
  'staff@eventforge.com',
  'attendee@eventforge.com',
]);

const isDemoAccountEmail = (email) => demoAccountEmails.has(email.toLowerCase());

module.exports = { isDemoAccountEmail };
