const updateUserReputation = (user) => {
  const completed = user.stats?.completedTasks || 0;
  let title = 'NEW VOLUNTEER';
  let level = 'New Volunteer';

  if (completed >= 10) {
    title = 'IMPACT MAKER';
    level = 'Impact Maker';
  } else if (completed >= 5) {
    title = 'COMMUNITY HELPER';
    level = 'Community Helper';
  } else if (completed >= 1) {
    title = 'ACTIVE VOLUNTEER';
    level = 'Active Volunteer';
  }

  user.reputation = { level: title, title: level };
  return user;
};

module.exports = { updateUserReputation };
