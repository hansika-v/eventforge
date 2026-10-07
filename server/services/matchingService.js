const skillWeights = {
  'Design': 35,
  'Translation': 30,
  'Documentation': 25,
  'Digital Assistance': 20,
  'Education': 25,
  'Community Support': 18,
  'Event Support': 20,
  'Accessibility': 22,
  'Elderly Assistance': 25,
  'Social Awareness': 20,
};

const computeMatchScore = (user, task, timeChoice) => {
  const skillMatches = user.skills?.filter((skill) => task.requiredSkills?.includes(skill)) || [];
  const interestMatches = user.interests?.filter((interest) => interest === task.category || interest === task.cause) || [];
  const causeMatch = user.causes?.includes(task.cause) ? 1 : 0;
  const timeFit = Math.min(1, Number(task.duration || 0) / Number(timeChoice || 15));
  const modeMatch = user.preferences?.preferredMode === task.mode || task.mode === 'Hybrid' ? 1 : 0;
  const locationMatch = task.mode === 'Online' || !user.preferences?.location || user.preferences.location === 'Remote' || task.location === user.preferences.location ? 1 : 0;
  const urgencyBoost = task.urgency === 'Urgent' ? 1 : task.urgency === 'High' ? 0.8 : 0.6;

  const skillScore = (skillMatches.length / Math.max(1, task.requiredSkills?.length || 1)) * 35;
  const interestScore = ((interestMatches.length + (causeMatch ? 1 : 0)) / 4) * 20;
  const timeScore = timeFit * 20;
  const modeScore = modeMatch * 10;
  const locationScore = locationMatch * 5;
  const urgencyScore = urgencyBoost * 10;

  const total = Math.min(99, Math.max(55, Math.round(skillScore + interestScore + timeScore + modeScore + locationScore + urgencyScore)));

  return {
    score: total,
    reasons: [
      ...(skillMatches.length ? ['✓ Skill match'] : []),
      ...(interestMatches.length || causeMatch ? ['✓ Interest or cause alignment'] : []),
      ...(timeFit >= 0.75 ? ['✓ Fits your available time'] : ['✓ Flexible time fit']),
      ...(modeMatch ? ['✓ Preferred mode works'] : ['✓ Flexible delivery option']),
      ...(locationMatch ? ['✓ Location fits your setup'] : ['✓ Remote flexibility available']),
      ...(task.urgency === 'Urgent' ? ['✓ High-priority task'] : []),
    ],
  };
};

const getTaskRecommendations = (user, tasks, timeChoice = user?.preferences?.availableTime || 15) => {
  return tasks
    .filter((task) => task.status === 'AVAILABLE' || task.status === 'ACCEPTED')
    .map((task) => {
      const { score, reasons } = computeMatchScore(user, task, timeChoice);
      return {
        task,
        matchScore: score,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
};

module.exports = { getTaskRecommendations, computeMatchScore };
