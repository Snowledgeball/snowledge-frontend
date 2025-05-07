// Données factices pour les différentes interfaces d'outils du tableau de bord

// Données pour le moniteur de sentiments
export const sentimentData = {
    platformSentiment: [
        { platform: "Twitter", positive: 68, neutral: 24, negative: 8 },
        { platform: "Reddit", positive: 72, neutral: 18, negative: 10 },
        { platform: "News", positive: 54, neutral: 32, negative: 14 },
        { platform: "Blogs", positive: 62, neutral: 28, negative: 10 },
    ],
    associatedTopics: [
        { topic: "Bitcoin", sentiment: "positif", percentage: 72 },
        { topic: "Ethereum", sentiment: "positif", percentage: 68 },
        { topic: "Trading", sentiment: "neutre", percentage: 52 },
        { topic: "Régulation", sentiment: "négatif", percentage: 38 },
        { topic: "DeFi", sentiment: "positif", percentage: 74 },
        { topic: "NFT", sentiment: "neutre", percentage: 50 },
    ],
    significantMentions: [
        { text: "Les crypto-monnaies représentent l'avenir de la finance...", platform: "Twitter", user: "@crypto_expert", sentiment: "positif" },
        { text: "Attention aux risques liés aux investissements dans les crypto-actifs...", platform: "Blog", user: "CryptoAnalyse", sentiment: "neutre" },
        { text: "Une nouvelle régulation qui pourrait impacter négativement le marché...", platform: "News", user: "CryptoNews", sentiment: "négatif" },
        { text: "Le Bitcoin atteint un nouveau record suite à l'adoption institutionnelle...", platform: "Reddit", user: "r/cryptocurrency", sentiment: "positif" },
    ]
};

// Données pour le détecteur de signaux
export const signalsData = {
    recentSignals: [
        {
            title: "Hausse soudaine de mentions de 'layer 3'",
            description: "Les discussions autour des solutions de layer 3 ont augmenté de 350% en 48h",
            confidence: 89,
            time: "Il y a 2h",
            sources: 47,
            intensity: "Fort",
            domain: "Blockchain"
        },
        {
            title: "Nouvelle tendance: 'RWA tokenization'",
            description: "L'intérêt pour la tokenisation des actifs du monde réel est en forte hausse",
            confidence: 76,
            time: "Il y a 5h",
            sources: 32,
            intensity: "Moyen",
            domain: "Finance"
        },
        {
            title: "Convergence AI & Blockchain en accélération",
            description: "Un nombre croissant de projets intègrent l'IA dans leurs solutions blockchain",
            confidence: 92,
            time: "Il y a 12h",
            sources: 64,
            intensity: "Fort",
            domain: "Tech"
        },
        {
            title: "Sentiment négatif autour de 'stablecoins algorithmiques'",
            description: "Baisse de confiance détectée envers les stablecoins algorithmiques suite à des rumeurs",
            confidence: 68,
            time: "Il y a 1j",
            sources: 28,
            intensity: "Moyen",
            domain: "Crypto"
        },
    ],
    predictions: {
        trendProbability: "74%",
        similarSignals: "12",
        adoptionTime: "3-6 mois",
        disruptivePotential: "Moyen-Élevé"
    },
    recommendedActions: [
        "Créer une veille dédiée sur le sujet 'layer 3'",
        "Organiser un brainstorming avec l'équipe sur les implications",
        "Préparer un article sur ce sujet émergent",
        "Contacter des experts pour obtenir leurs perspectives"
    ]
};

// Données pour l'AI Assistant de rédaction
export const aiAssistantData = {
    suggestions: [
        {
            text: "Votre introduction pourrait être plus percutante. Essayez d'ajouter une statistique frappante.",
            action: "Appliquer"
        },
        {
            text: "Le troisième paragraphe contient des redondances. Cliquez pour simplifier.",
            action: "Appliquer"
        },
        {
            text: "Suggestion de mots-clés à inclure: blockchain, décentralisation, adoption.",
            action: "Insérer"
        }
    ],
    toneOptions: [
        "Expert / Technique",
        "Formel / Professionnel",
        "Conversationnel",
        "Explicatif / Pédagogique"
    ],
    formatOptions: [
        "Article de fond",
        "Analyse de marché",
        "Guide étape par étape",
        "Point de vue"
    ],
    seoScore: 70
};

// Données pour le planificateur de publication
export const schedulerData = {
    upcomingPublications: [
        { title: "Analyse de l'ETF Bitcoin", date: "Demain, 10:00", platform: "Blog", status: "Prêt" },
        { title: "Guide du staking", date: "Jeudi, 14:30", platform: "Blog & Social", status: "En préparation" },
        { title: "Résumé hebdomadaire crypto", date: "Vendredi, 18:00", platform: "Newsletter", status: "Récurrent" },
        { title: "Les perspectives 2024", date: "Lundi, 9:00", platform: "Toutes plateformes", status: "Brouillon" },
    ],
    statistics: {
        monthlyPublications: 12,
        activeDays: "8/30",
        peakTime: "10:00 - 12:00",
        averagePerformance: "+18%"
    }
};

// Données pour analytics
export const analyticsData = {
    platforms: [
        { name: "Twitter", color: "blue" },
        { name: "Reddit", color: "red" },
        { name: "News", color: "yellow" },
        { name: "Blogs", color: "green" }
    ],
    recommendedActions: [
        "Optimiser les performances de votre contenu",
        "Améliorer la qualité des articles",
        "Développer des stratégies de marketing"
    ]
};

// Données pour la monétisation
export const monetizationData = {
    revenueStats: [
        { name: "Revenus totaux", value: "1,248.35€", icon: "Wallet", change: "+18.3%" },
        { name: "Par membre", value: "8.72€", icon: "Users", change: "+4.2%" },
        { name: "Par contenu", value: "78.02€", icon: "FileText", change: "-2.8%", negative: true },
        { name: "Prévision mensuelle", value: "1,450€", icon: "TrendingUp", change: "+16.2%" }
    ],
    revenueDetails: [
        {
            source: "Abonnements mensuels",
            revenue: "774.50€",
            change: "+12.4%",
            transactions: 62,
            conversion: "8.3%",
            trend: "up"
        },
        {
            source: "Articles premium",
            revenue: "299.28€",
            change: "+28.6%",
            transactions: 43,
            conversion: "5.1%",
            trend: "up"
        },
        {
            source: "Partenariats sponsorisés",
            revenue: "99.85€",
            change: "-8.2%",
            transactions: 3,
            conversion: "63.4%",
            trend: "down"
        },
        {
            source: "Dons et pourboires",
            revenue: "74.72€",
            change: "+42.1%",
            transactions: 28,
            conversion: "1.2%",
            trend: "up"
        }
    ],
    revenueSources: [
        { source: "Abonnements", percentage: 62, color: "blue" },
        { source: "Contenu premium", percentage: 24, color: "green" },
        { source: "Partenariats", percentage: 8, color: "purple" },
        { source: "Dons & Tips", percentage: 6, color: "yellow" }
    ],
    optimizationRecommendations: [
        {
            title: "Augmentez vos revenus d'abonnement de 15%",
            description: "Créer un niveau d'abonnement premium avec du contenu exclusif pourrait générer 180€ supplémentaires par mois.",
            type: "green"
        },
        {
            title: "Optimisez vos articles premium",
            description: "Vos articles sur la DeFi ont un taux de conversion de 12.3%. Créez plus de contenu sur ce sujet pour maximiser les revenus.",
            type: "blue"
        }
    ]
};

// Données pour la diffusion multi-canaux
export const multiChannelData = {
    platforms: [
        { name: "Twitter", icon: "twitter", color: "blue", connected: true },
        { name: "LinkedIn", icon: "linkedin", color: "indigo", connected: true },
        { name: "Facebook", icon: "facebook", color: "blue", connected: true },
        { name: "Instagram", icon: "instagram", color: "pink", connected: false },
        { name: "Medium", icon: "medium", color: "gray", connected: true },
        { name: "Newsletter", icon: "mail", color: "amber", connected: true },
        { name: "Discord", icon: "discord", color: "purple", connected: false },
        { name: "YouTube", icon: "youtube", color: "red", connected: false },
    ],
    platformStats: [
        { platform: "Twitter", posts: 42, engagement: "3.8%", reach: "15.2K", growth: "+12%" },
        { platform: "LinkedIn", posts: 28, engagement: "5.1%", reach: "8.7K", growth: "+8%" },
        { platform: "Medium", posts: 16, engagement: "7.2%", reach: "4.5K", growth: "+15%" },
        { platform: "Newsletter", posts: 8, engagement: "24.6%", reach: "1.2K", growth: "+3%" },
    ],
    recentPosts: [
        { title: "Le futur de la finance décentralisée", date: "Hier, 14:30", platforms: ["Twitter", "LinkedIn", "Newsletter"], performance: "Excellent" },
        { title: "Analyse: Impact des ETF Bitcoin", date: "26 mars, 10:15", platforms: ["Twitter", "Medium"], performance: "Bon" },
        { title: "Guide du staking pour débutants", date: "22 mars, 16:00", platforms: ["Toutes plateformes"], performance: "Moyen" },
        { title: "Tendances crypto du mois", date: "18 mars, 09:30", platforms: ["Newsletter", "LinkedIn"], performance: "Excellent" },
    ]
};

// Données pour les templates 
export const templatesData = Array.from({ length: 6 }).map((_, i) => ({
    category: ["Finance", "Crypto", "Tech", "Économie", "Blockchain", "DeFi"][i % 6],
    source: ["Bloomberg", "CoinDesk", "TechCrunch", "Reuters", "Forbes", "The Verge"][i % 6],
    time: [2, 5, 8, 12, 18, 24][i % 6],
    title: [
        "La tendance haussière du marché va-t-elle continuer?",
        "Nouvelles projections pour l'adoption des cryptomonnaies",
        "Comment l'IA transforme le monde de la finance",
        "Les banques centrales face aux défis de la digitalisation",
        "Rapport sur l'évolution des technologies blockchain",
        "Le futur de la finance décentralisée en 2024"
    ][i % 6]
}));

// Données pour le scanner de tendances
export const trendScannerData = {
    timeOptions: ["Dernières 24h", "7 derniers jours", "30 derniers jours"],
    trendingTopics: [
        { name: "Bitcoin ETF", growth: "+345%", category: "Crypto", trend: "up" },
        { name: "Réglementation UE", growth: "+122%", category: "Finance", trend: "up" },
        { name: "DeFi Yield", growth: "-18%", category: "DeFi", trend: "down" },
        { name: "NFT Marketplace", growth: "+67%", category: "NFT", trend: "up" },
        { name: "Layer 2 Scaling", growth: "+205%", category: "Blockchain", trend: "up" },
        { name: "Stablecoins", growth: "+5%", category: "Crypto", trend: "stable" },
    ]
};

// Données pour l'agrégateur de sources
export const aggregatorData = {
    filters: {
        sources: ["Toutes les sources", "Veille technologique", "Actus finance", "Blogs spécialisés"],
        formats: ["Tous les formats", "Articles", "Vidéos", "Newsletters"],
        periods: ["Dernières 24h", "7 derniers jours", "30 derniers jours"]
    }
}; 