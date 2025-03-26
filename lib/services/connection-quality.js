import { prisma } from "@/lib/prisma"
import { analyzeText } from "@/lib/ai/text-analysis"

export class ConnectionQualityService {
  constructor(userId) {
    this.userId = userId
  }

  async analyzeConnectionQuality(targetUserId) {
    const [userProfile, targetProfile] = await Promise.all([
      this.getUserProfile(this.userId),
      this.getUserProfile(targetUserId)
    ])

    const analysis = {
      compatibility: await this.calculateCompatibility(userProfile, targetProfile),
      interactionPotential: await this.assessInteractionPotential(userProfile, targetProfile),
      growthOpportunities: await this.identifyGrowthOpportunities(userProfile, targetProfile),
      riskFactors: await this.assessRiskFactors(userProfile, targetProfile)
    }

    return {
      ...analysis,
      score: this.calculateOverallScore(analysis),
      recommendations: await this.generateRecommendations(analysis)
    }
  }

  private async getUserProfile(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        personalityProfile: true,
        interactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        learningPoints: {
          take: 20,
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  private async calculateCompatibility(user1, user2) {
    const factors = {
      interests: this.compareInterests(
        user1.personalityProfile?.interests || [],
        user2.personalityProfile?.interests || []
      ),
      personality: await this.comparePersonality(
        user1.personalityProfile?.traits,
        user2.personalityProfile?.traits
      ),
      goals: this.compareGoals(
        user1.personalityProfile?.goals,
        user2.personalityProfile?.goals
      ),
      expertise: this.calculateExpertiseAlignment(
        user1.personalityProfile,
        user2.personalityProfile
      )
    }

    return {
      factors,
      score: Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length
    }
  }

  private compareInterests(interests1, interests2) {
    const set1 = new Set(interests1)
    const set2 = new Set(interests2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    return intersection.size / union.size
  }

  private async comparePersonality(traits1, traits2) {
    if (!traits1 || !traits2) return 0.5

    const weights = {
      openness: 0.2,
      conscientiousness: 0.2,
      extraversion: 0.15,
      agreeableness: 0.25,
      neuroticism: 0.2
    }

    return Object.keys(weights).reduce((score, trait) => {
      const diff = Math.abs((traits1[trait] || 0.5) - (traits2[trait] || 0.5))
      return score + (1 - diff) * weights[trait]
    }, 0)
  }

  private compareGoals(goals1, goals2) {
    if (!goals1 || !goals2) return 0.5

    const alignmentScore = goals1.reduce((score, goal) => {
      const matchingGoal = goals2.find(g => g.category === goal.category)
      if (!matchingGoal) return score
      return score + (1 - Math.abs(goal.priority - matchingGoal.priority) / 5)
    }, 0)

    return alignmentScore / Math.max(goals1.length, goals2.length)
  }

  private calculateExpertiseAlignment(profile1, profile2) {
    if (!profile1?.expertise || !profile2?.expertise) return 0.5

    const expertise1 = new Set(profile1.expertise)
    const expertise2 = new Set(profile2.expertise)
    
    // Calculate direct overlap
    const intersection = new Set([...expertise1].filter(x => expertise2.has(x)))
    const directOverlap = intersection.size / Math.max(expertise1.size, expertise2.size)

    // Calculate complementary score
    const complementaryScore = this.assessComplementaryExpertise(profile1, profile2)

    return (directOverlap + complementaryScore) / 2
  }

  private assessComplementaryExpertise(profile1, profile2) {
    if (!profile1?.expertise || !profile2?.expertise) return 0.5

    const complementaryPairs = {
      'frontend': ['backend', 'ui/ux', 'design'],
      'backend': ['frontend', 'devops', 'database'],
      'design': ['frontend', 'product', 'marketing'],
      'marketing': ['design', 'sales', 'content'],
      'product': ['design', 'development', 'marketing'],
      'data': ['ai/ml', 'analytics', 'research'],
      'ai/ml': ['data', 'research', 'engineering']
    }

    let complementaryScore = 0
    const expertise1 = new Set(profile1.expertise)
    const expertise2 = new Set(profile2.expertise)

    expertise1.forEach(skill => {
      const complementary = complementaryPairs[skill] || []
      complementary.forEach(compSkill => {
        if (expertise2.has(compSkill)) {
          complementaryScore += 1
        }
      })
    })

    const maxPossibleScore = Math.min(
      expertise1.size * 3, // Each skill can have up to 3 complementary skills
      expertise2.size * 3
    )

    return complementaryScore / (maxPossibleScore || 1)
  }

  private async assessInteractionPotential(user1, user2) {
    const factors = {
      activityAlignment: await this.calculateActivityAlignment(user1, user2),
      communicationStyle: this.comparePersonalityFactors(user1, user2),
      sharedContexts: await this.findSharedContexts(user1, user2),
      engagementLevel: await this.predictEngagementLevel(user1, user2)
    }

    return Object.values(factors).reduce((sum, val) => sum + val, 0) / Object.keys(factors).length
  }

  private async calculateActivityAlignment(user1, user2) {
    const [user1Activity, user2Activity] = await Promise.all([
      this.getActivityPattern(user1.id),
      this.getActivityPattern(user2.id)
    ])

    // Compare activity patterns (time of day, frequency, etc.)
    let alignmentScore = 0
    const timeSlots = 24 // 24 hours

    for (let i = 0; i < timeSlots; i++) {
      const diff = Math.abs(user1Activity[i] - user2Activity[i])
      alignmentScore += 1 - (diff / Math.max(user1Activity[i], user2Activity[i], 1))
    }

    return alignmentScore / timeSlots
  }

  private async getActivityPattern(userId) {
    const activities = await prisma.interaction.findMany({
      where: { userId },
      select: { createdAt: true }
    })

    const pattern = new Array(24).fill(0)
    activities.forEach(activity => {
      const hour = new Date(activity.createdAt).getHours()
      pattern[hour]++
    })

    return pattern
  }

  private async findSharedContexts(user1, user2) {
    const contexts = {
      interests: this.compareInterests(
        user1.personalityProfile?.interests || [],
        user2.personalityProfile?.interests || []
      ),
      industry: this.compareIndustry(
        user1.personalityProfile?.industry,
        user2.personalityProfile?.industry
      ),
      connections: await this.analyzeSharedConnections(user1.id, user2.id)
    }

    return Object.values(contexts).reduce((sum, val) => sum + val, 0) / Object.keys(contexts).length
  }

  private async analyzeSharedConnections(userId1, userId2) {
    const connections1 = await this.getConnections(userId1)
    const connections2 = await this.getConnections(userId2)

    const shared = connections1.filter(id => connections2.includes(id))
    const totalPossible = Math.min(connections1.length, connections2.length)

    return shared.length / (totalPossible || 1)
  }

  private async identifyGrowthOpportunities(user1, user2) {
    const opportunities = []

    // Skill complementarity
    const skillGaps = await this.findSkillGaps(user1, user2)
    if (skillGaps.length > 0) {
      opportunities.push({
        type: 'SKILL_DEVELOPMENT',
        areas: skillGaps,
        potential: this.calculateLearningPotential(skillGaps)
      })
    }

    // Network expansion
    const networkOpportunities = await this.analyzeNetworkOpportunities(user1, user2)
    if (networkOpportunities.score > 0.7) {
      opportunities.push({
        type: 'NETWORK_EXPANSION',
        details: networkOpportunities.details,
        potential: networkOpportunities.score
      })
    }

    // Knowledge sharing
    const knowledgeAreas = this.identifyKnowledgeSharingAreas(user1, user2)
    if (knowledgeAreas.length > 0) {
      opportunities.push({
        type: 'KNOWLEDGE_SHARING',
        areas: knowledgeAreas,
        potential: this.calculateSharingPotential(knowledgeAreas)
      })
    }

    return opportunities
  }

  private async assessRiskFactors(user1, user2) {
    const risks = []

    // Communication style mismatch
    const communicationCompatibility = await this.assessCommunicationCompatibility(user1, user2)
    if (communicationCompatibility < 0.5) {
      risks.push({
        type: 'COMMUNICATION_MISMATCH',
        severity: 1 - communicationCompatibility,
        mitigation: this.generateCommunicationMitigationStrategies()
      })
    }

    // Expertise overlap (too much or too little)
    const expertiseAlignment = this.calculateExpertiseAlignment(
      user1.personalityProfile,
      user2.personalityProfile
    )
    if (expertiseAlignment < 0.3 || expertiseAlignment > 0.9) {
      risks.push({
        type: expertiseAlignment < 0.3 ? 'LOW_OVERLAP' : 'HIGH_OVERLAP',
        severity: Math.min(Math.abs(expertiseAlignment - 0.6) * 2, 1),
        mitigation: this.generateExpertiseMitigationStrategies(expertiseAlignment)
      })
    }

    // Activity pattern mismatch
    const activityAlignment = await this.calculateActivityAlignment(user1, user2)
    if (activityAlignment < 0.4) {
      risks.push({
        type: 'ACTIVITY_MISMATCH',
        severity: 1 - activityAlignment,
        mitigation: this.generateActivityMitigationStrategies()
      })
    }

    return risks
  }

  private async generateRecommendations(analysis) {
    const recommendations = []

    // Connection approach recommendations
    if (analysis.compatibility.score > 0.7) {
      recommendations.push({
        type: 'APPROACH',
        priority: 'HIGH',
        suggestion: 'Initiate direct connection with personalized message',
        context: this.generateApproachContext(analysis)
      })
    }

    // Interaction recommendations
    const interactionRecs = this.generateInteractionRecommendations(analysis)
    recommendations.push(...interactionRecs)

    // Growth focus recommendations
    if (analysis.growthOpportunities.length > 0) {
      recommendations.push({
        type: 'GROWTH_FOCUS',
        priority: 'MEDIUM',
        areas: analysis.growthOpportunities.map(opp => ({
          area: opp.type,
          approach: this.generateGrowthApproach(opp)
        }))
      })
    }

    // Risk mitigation recommendations
    analysis.riskFactors.forEach(risk => {
      recommendations.push({
        type: 'RISK_MITIGATION',
        priority: risk.severity > 0.7 ? 'HIGH' : 'MEDIUM',
        risk: risk.type,
        actions: risk.mitigation
      })
    })

    return recommendations
  }

  private calculateOverallScore(analysis) {
    const weights = {
      compatibility: 0.4,
      interactionPotential: 0.3,
      growthOpportunities: 0.2,
      riskFactors: 0.1
    }

    return Object.entries(weights).reduce((score, [key, weight]) => {
      const value = typeof analysis[key] === 'number' 
        ? analysis[key]
        : analysis[key].length ? 1 : 0
      return score + value * weight
    }, 0)
  }
} 