export const MESSAGE_TEMPLATES = {
  PROFESSIONAL: {
    INITIAL: [
      {
        template: "Hi {{name}}, I noticed we share interests in {{commonInterests}}. I'd love to connect and explore potential collaborations in {{focusArea}}.",
        conditions: { minCompatibility: 0.7 }
      },
      {
        template: "Hello {{name}}, your experience in {{expertise}} caught my attention. I'm particularly interested in your work on {{recentActivity}}.",
        conditions: { hasRecentActivity: true }
      }
    ],
    FOLLOW_UP: [
      {
        template: "Thanks for connecting, {{name}}! I'd love to hear more about your thoughts on {{topic}}.",
        conditions: { connectionAge: "new" }
      }
    ]
  },
  CASUAL: {
    INITIAL: [
      {
        template: "Hey {{name}}! I see we're both interested in {{commonInterests}}. Would love to chat about it!",
        conditions: { minCompatibility: 0.5 }
      }
    ],
    FOLLOW_UP: [
      {
        template: "Great to connect, {{name}}! What got you interested in {{interest}}?",
        conditions: { connectionAge: "new" }
      }
    ]
  },
  SKILL_BASED: {
    INITIAL: [
      {
        template: "Hi {{name}}, I noticed your expertise in {{skill}}. I'm currently exploring this area and would love to learn from your experience.",
        conditions: { skillMatch: true }
      }
    ]
  }
}

export const VARIABLES = {
  name: (user) => user.name,
  commonInterests: (user, context) => {
    const common = context.commonInterests || []
    return common.length > 1 
      ? `${common.slice(0, -1).join(', ')} and ${common.slice(-1)}`
      : common[0]
  },
  focusArea: (user, context) => context.focusArea,
  expertise: (user) => user.personalityProfile?.expertise || "your field",
  recentActivity: (user, context) => context.recentActivity,
  topic: (user, context) => context.suggestedTopic,
  interest: (user, context) => context.commonInterests?.[0],
  skill: (user) => user.personalityProfile?.topSkill
} 