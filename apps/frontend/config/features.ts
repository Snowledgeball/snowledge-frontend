export const features = {
  home: {
    enabled: true,
    testimonials: true,
  },
  createCommunity: {
    enabled: true,
  },
  community: {
    enabled: true,
    // Groupe pour les créateurs (creator)
    creator: {
      enabled: true,
      logs: true,
      moderation: true,
      pricing: true,
      invite: true,
      members: true,
      settings: {
        enabled: true,
        general: true,
        access: true,
        gains: true,
      },
    },
    // Groupe pour les apprenants (learner)
    learner: {
      enabled: true,
      dashboard: {
        enabled: true,
        details: true,
        overview: true,
      },
      faq: true,
      calendar: {
        enabled: true,
        myEvents: true,
        events: true,
      },
      notifications: {
        enabled: true,
      },
      resources: {
        enabled: true,
        links: true,
        documents: true,
      },
      discussions: {
        enabled: true,
        chat: true,
        forum: true,
      },
      content: {
        enabled: true,
        articles: true,
        videos: true,
        podcasts: true,
      },
      ideas: {
        enabled: true,
        myIdeas: true,
        propose: true,
      },
      support: {
        enabled: true,
      },
    },
    // Groupe pour les contributeurs (contributor)
    contributor: {
      enabled: true,
      contribute: {
        enabled: true,
        collaborations: true,
        validateIdeas: true,
        myContributions: true,
        propose: true,
      },
      resourcesContrib: {
        enabled: true,
        tutorials: true,
        history: true,
        leaderboard: true,
      },
      tools: {
        enabled: true,
        badges: true,
        validationRequests: true,
        stats: true,
      },
    },
  },
};
