const getImpactForDuration = (minutes) => {
  const standardized = {
    5: 5,
    10: 10,
    15: 15,
    20: 20,
    30: 30,
    60: 60,
  };

  if (standardized[minutes]) return standardized[minutes];
  return Math.max(5, Math.round(minutes / 5));
};

const calculateTaskImpact = (task) => {
  const duration = Number(task?.duration || 0);
  let points = getImpactForDuration(duration);

  if (task?.urgency === 'Urgent') {
    points += 5;
  }

  return { points, minutes: duration };
};

module.exports = { calculateTaskImpact, getImpactForDuration };
