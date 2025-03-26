export const ACHIEVEMENTS = {
  // Connection Achievements
  CONNECTOR_BRONZE: {
    type: "CONNECTOR",
    name: "Social Butterfly",
    description: "Connect with 10 digital twins",
    requirement: 10
  },
  CONNECTOR_SILVER: {
    type: "CONNECTOR",
    name: "Network Builder",
    description: "Connect with 50 digital twins",
    requirement: 50
  },
  CONNECTOR_GOLD: {
    type: "CONNECTOR",
    name: "Connection Master",
    description: "Connect with 100 digital twins",
    requirement: 100
  },

  // Analysis Achievements
  ANALYST_BRONZE: {
    type: "ANALYST",
    name: "Insight Seeker",
    description: "Complete 10 interaction analyses",
    requirement: 10
  },
  ANALYST_SILVER: {
    type: "ANALYST",
    name: "Deep Thinker",
    description: "Complete 50 interaction analyses",
    requirement: 50
  },
  ANALYST_GOLD: {
    type: "ANALYST",
    name: "Master Analyst",
    description: "Complete 100 interaction analyses",
    requirement: 100
  },

  // Timeline Achievements
  EXPLORER_BRONZE: {
    type: "EXPLORER",
    name: "Timeline Explorer",
    description: "Create 5 alternate timelines",
    requirement: 5
  },
  EXPLORER_SILVER: {
    type: "EXPLORER",
    name: "Timeline Navigator",
    description: "Create 25 alternate timelines",
    requirement: 25
  },
  EXPLORER_GOLD: {
    type: "EXPLORER",
    name: "Timeline Master",
    description: "Create 50 alternate timelines",
    requirement: 50
  },

  // Streak Achievements
  CONSISTENT_BRONZE: {
    type: "CONSISTENT",
    name: "Steady Progress",
    description: "Maintain a 7-day activity streak",
    requirement: 7
  },
  CONSISTENT_SILVER: {
    type: "CONSISTENT",
    name: "Dedicated User",
    description: "Maintain a 30-day activity streak",
    requirement: 30
  },
  CONSISTENT_GOLD: {
    type: "CONSISTENT",
    name: "Unwavering Commitment",
    description: "Maintain a 100-day activity streak",
    requirement: 100
  },

  // Quality Achievements
  QUALITY_BRONZE: {
    type: "QUALITY",
    name: "Quality Seeker",
    description: "Achieve 80%+ compatibility in 5 connections",
    requirement: 5
  },
  QUALITY_SILVER: {
    type: "QUALITY",
    name: "Quality Expert",
    description: "Achieve 90%+ compatibility in 10 connections",
    requirement: 10
  },
  QUALITY_GOLD: {
    type: "QUALITY",
    name: "Quality Master",
    description: "Achieve 95%+ compatibility in 20 connections",
    requirement: 20
  }
}

export const REWARD_TYPES = {
  XP_BOOST: {
    name: "XP Boost",
    description: "Earn extra XP for your next actions",
    duration: 24 * 60 * 60 * 1000 // 24 hours
  },
  THEME_UNLOCK: {
    name: "Theme Unlock",
    description: "Unlock a special theme for your digital twin",
    permanent: true
  },
  FEATURE_UNLOCK: {
    name: "Feature Unlock",
    description: "Unlock a special feature for your digital twin",
    permanent: true
  },
  BADGE: {
    name: "Special Badge",
    description: "Display a unique badge on your profile",
    permanent: true
  },
  MULTIPLIER: {
    name: "Connection Multiplier",
    description: "Increase your connection compatibility scores",
    duration: 12 * 60 * 60 * 1000 // 12 hours
  }
}

export const LEVEL_MILESTONES = {
  5: {
    type: "THEME_UNLOCK",
    name: "Bronze Theme",
    description: "Unlock the bronze theme for reaching level 5"
  },
  10: {
    type: "FEATURE_UNLOCK",
    name: "Advanced Analysis",
    description: "Unlock advanced analysis features"
  },
  20: {
    type: "THEME_UNLOCK",
    name: "Silver Theme",
    description: "Unlock the silver theme for reaching level 20"
  },
  50: {
    type: "THEME_UNLOCK",
    name: "Gold Theme",
    description: "Unlock the gold theme for reaching level 50"
  },
  100: {
    type: "BADGE",
    name: "Centurion Badge",
    description: "A special badge for reaching level 100"
  }
} 