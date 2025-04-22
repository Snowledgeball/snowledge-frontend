// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { randomBytes } from "crypto";

const prisma = new PrismaClient();

async function main() {
  // Supprimer les données existantes (dans l'ordre inverse des dépendances)
  await prisma.$transaction([
    prisma.community_proposal_votes.deleteMany(),
    prisma.community_proposals.deleteMany(),
    prisma.community_qa_answers.deleteMany(),
    prisma.community_qa_questions.deleteMany(),
    prisma.community_posts_comments.deleteMany(),
    prisma.community_posts_comment_conversations.deleteMany(),
    prisma.community_posts_enrichment_reviews.deleteMany(),
    prisma.community_posts_enrichments.deleteMany(),
    prisma.community_posts_reviews.deleteMany(),
    prisma.community_posts.deleteMany(),
    prisma.community_posts_category.deleteMany(),
    prisma.community_presentation.deleteMany(),
    prisma.community_channels.deleteMany(),
    prisma.community_bans.deleteMany(),
    prisma.community_contributors_requests.deleteMany(),
    prisma.community_contributors.deleteMany(),
    prisma.community_learners.deleteMany(),
    prisma.community.deleteMany(),
    prisma.community_category.deleteMany(),
    prisma.snowledgeRegister.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Générer des clés pour les utilisateurs
  const generateCryptoKeys = () => {
    return {
      accountAddress: `0x${randomBytes(20).toString("hex")}`.slice(0, 65),
      publicKey: `0x${randomBytes(20).toString("hex")}`.slice(0, 65),
      privateKey: `0x${randomBytes(64).toString("hex")}`.slice(0, 160),
      salt: randomBytes(16).toString("hex"),
      iv: randomBytes(16).toString("hex"),
    };
  };

  // Créer les catégories de communautés
  const categories = await Promise.all([
    prisma.community_category.create({
      data: {
        name: "tech",
        label: "Technologie",
      },
    }),
    prisma.community_category.create({
      data: {
        name: "science",
        label: "Science",
      },
    }),
    prisma.community_category.create({
      data: {
        name: "art",
        label: "Art et Culture",
      },
    }),
  ]);

  // Créer des utilisateurs
  const hashedPassword = await hash("Password123!", 10);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: "Admin User",
        userName: "admin",
        email: "admin@example.com",
        password: hashedPassword,
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
        ...generateCryptoKeys(),
      },
    }),
    prisma.user.create({
      data: {
        fullName: "Pierre Dupont",
        userName: "pierre",
        email: "pierre@example.com",
        password: hashedPassword,
        profilePicture:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=pierre",
        ...generateCryptoKeys(),
      },
    }),
    prisma.user.create({
      data: {
        fullName: "Marie Martin",
        userName: "marie",
        email: "marie@example.com",
        password: hashedPassword,
        profilePicture: "https://api.dicebear.com/7.x/avataaars/svg?seed=marie",
        ...generateCryptoKeys(),
      },
    }),
  ]);

  // Créer des communautés
  const communities = await Promise.all([
    prisma.community.create({
      data: {
        name: "Blockchain Enthusiasts",
        creator_id: users[0].id,
        description:
          "Une communauté dédiée à la blockchain et aux technologies Web3",
        image_url: "https://picsum.photos/id/0/200",
        category_id: categories[0].id,
        community_presentation: {
          create: {
            topic_details:
              "Notre communauté explore les derniers développements en matière de blockchain.",
            code_of_conduct:
              "Soyez respectueux et constructifs dans vos échanges.",
            disclaimers: "Ce groupe ne fournit pas de conseils financiers.",
          },
        },
      },
    }),
    prisma.community.create({
      data: {
        name: "Climate Science",
        creator_id: users[1].id,
        description:
          "Discussions sur le changement climatique et la durabilité",
        image_url: "https://picsum.photos/id/10/200",
        category_id: categories[1].id,
        community_presentation: {
          create: {
            topic_details:
              "Notre communauté s'intéresse aux dernières recherches sur le climat.",
            code_of_conduct: "Basez vos arguments sur des faits scientifiques.",
            disclaimers:
              "Nous ne sommes pas affiliés à des groupes politiques.",
          },
        },
      },
    }),
  ]);

  // Créer des catégories de posts pour chaque communauté
  const postCategories = await Promise.all([
    prisma.community_posts_category.create({
      data: {
        community_id: communities[0].id,
        name: "tutorials",
        label: "Tutoriels",
      },
    }),
    prisma.community_posts_category.create({
      data: {
        community_id: communities[0].id,
        name: "news",
        label: "Actualités",
      },
    }),
    prisma.community_posts_category.create({
      data: {
        community_id: communities[1].id,
        name: "research",
        label: "Recherche",
      },
    }),
  ]);

  // Ajouter des membres aux communautés
  await Promise.all([
    prisma.community_learners.create({
      data: {
        community_id: communities[0].id,
        learner_id: users[1].id,
      },
    }),
    prisma.community_learners.create({
      data: {
        community_id: communities[0].id,
        learner_id: users[2].id,
      },
    }),
    prisma.community_learners.create({
      data: {
        community_id: communities[1].id,
        learner_id: users[0].id,
      },
    }),
  ]);

  // Ajouter des contributeurs
  await Promise.all([
    prisma.community_contributors.create({
      data: {
        community_id: communities[0].id,
        contributor_id: users[2].id,
      },
    }),
    prisma.community_contributors.create({
      data: {
        community_id: communities[1].id,
        contributor_id: users[1].id,
      },
    }),
  ]);

  // Créer des canaux pour les communautés
  await Promise.all([
    prisma.community_channels.create({
      data: {
        community_id: communities[0].id,
        name: "general",
        description: "Discussion générale sur la blockchain",
        icon: "💬",
      },
    }),
    prisma.community_channels.create({
      data: {
        community_id: communities[0].id,
        name: "ressources",
        description: "Partage de ressources et d'outils",
        icon: "📚",
      },
    }),
    prisma.community_channels.create({
      data: {
        community_id: communities[1].id,
        name: "actus",
        description: "Actualités sur le climat",
        icon: "📰",
      },
    }),
  ]);

  // Créer des posts
  const posts = await Promise.all([
    prisma.community_posts.create({
      data: {
        community_id: communities[0].id,
        author_id: users[0].id,
        title: "Introduction à Ethereum",
        content:
          "Ethereum est une plateforme décentralisée qui permet de créer des applications sans serveur central...",
        tag: postCategories[0].id,
        cover_image_url: "https://picsum.photos/id/20/800/400",
        status: "APPROVED",
      },
    }),
    prisma.community_posts.create({
      data: {
        community_id: communities[1].id,
        author_id: users[1].id,
        title: "L'impact des émissions de carbone",
        content:
          "Les émissions de carbone continuent d'augmenter malgré les accords internationaux...",
        tag: postCategories[2].id,
        cover_image_url: "https://picsum.photos/id/25/800/400",
        status: "APPROVED",
      },
    }),
  ]);

  // Créer des conversations de commentaires
  const conversations = await Promise.all([
    prisma.community_posts_comment_conversations.create({
      data: {
        post_id: posts[0].id,
      },
    }),
    prisma.community_posts_comment_conversations.create({
      data: {
        post_id: posts[1].id,
      },
    }),
  ]);

  // Ajouter des commentaires
  await Promise.all([
    prisma.community_posts_comments.create({
      data: {
        conversation_id: conversations[0].id,
        author_id: users[1].id,
        content: "Excellent article, merci pour ces explications !",
      },
    }),
    prisma.community_posts_comments.create({
      data: {
        conversation_id: conversations[0].id,
        author_id: users[2].id,
        content: "Pourriez-vous détailler la partie sur les smart contracts ?",
      },
    }),
    prisma.community_posts_comments.create({
      data: {
        conversation_id: conversations[1].id,
        author_id: users[0].id,
        content: "Avez-vous des sources pour ces données ?",
      },
    }),
  ]);

  // Créer des reviews pour les posts
  await Promise.all([
    prisma.community_posts_reviews.create({
      data: {
        post_id: posts[0].id,
        reviewer_id: users[1].id,
        content: "Contenu bien documenté et facile à comprendre.",
        status: "APPROVED",
        is_validated: true,
      },
    }),
    prisma.community_posts_reviews.create({
      data: {
        post_id: posts[1].id,
        reviewer_id: users[0].id,
        content:
          "Les données semblent correctes mais quelques sources supplémentaires seraient appréciées.",
        status: "APPROVED",
        is_validated: true,
      },
    }),
  ]);

  // Créer des questions Q&A
  const questions = await Promise.all([
    prisma.community_qa_questions.create({
      data: {
        community_id: communities[0].id,
        author_id: users[1].id,
        question: "Comment configurer MetaMask pour un réseau de test ?",
        post_id: posts[0].id,
      },
    }),
    prisma.community_qa_questions.create({
      data: {
        community_id: communities[1].id,
        author_id: users[0].id,
        question:
          "Quelles sont les meilleures sources de données climatiques ?",
      },
    }),
  ]);

  // Ajouter des réponses aux questions
  await Promise.all([
    prisma.community_qa_answers.create({
      data: {
        question_id: questions[0].id,
        author_id: users[0].id,
        content:
          "Pour configurer MetaMask, allez dans Paramètres > Réseaux et ajoutez un nouveau réseau...",
        is_accepted: true,
      },
    }),
    prisma.community_qa_answers.create({
      data: {
        question_id: questions[1].id,
        author_id: users[1].id,
        content:
          "Je recommande les données du GIEC et de la NASA pour des informations fiables...",
      },
    }),
  ]);

  // Créer des propositions
  const proposals = await Promise.all([
    prisma.community_proposals.create({
      data: {
        community_id: communities[0].id,
        author_id: users[2].id,
        title: "Série de tutoriels sur Solidity",
        description:
          "Je propose de créer une série de tutoriels pour débutants sur Solidity.",
        status: "PENDING",
        possible_contributors: `${users[0].id},${users[1].id}`,
      },
    }),
    prisma.community_proposals.create({
      data: {
        community_id: communities[1].id,
        author_id: users[0].id,
        title: "Atelier virtuel sur l'empreinte carbone",
        description:
          "Organisons un atelier virtuel pour calculer et réduire son empreinte carbone.",
        status: "APPROVED",
      },
    }),
  ]);

  // Ajouter des votes sur les propositions
  await Promise.all([
    prisma.community_proposal_votes.create({
      data: {
        proposal_id: proposals[0].id,
        voter_id: users[0].id,
        vote: "APPROVED",
      },
    }),
    prisma.community_proposal_votes.create({
      data: {
        proposal_id: proposals[0].id,
        voter_id: users[1].id,
        vote: "APPROVED",
      },
    }),
    prisma.community_proposal_votes.create({
      data: {
        proposal_id: proposals[1].id,
        voter_id: users[1].id,
        vote: "APPROVED",
      },
    }),
  ]);

  // Créer des enrichissements de posts
  const enrichments = await Promise.all([
    prisma.community_posts_enrichments.create({
      data: {
        post_id: posts[0].id,
        user_id: users[2].id,
        title: "Mise à jour sur ETH2",
        content: "Ethereum 2.0 apporte plusieurs améliorations majeures...",
        original_content: "Ethereum est une plateforme décentralisée...",
        description: "Ajout d'informations sur la mise à jour ETH2",
        status: "PENDING",
      },
    }),
  ]);

  // Ajouter des revues d'enrichissements
  await Promise.all([
    prisma.community_posts_enrichment_reviews.create({
      data: {
        contribution_id: enrichments[0].id,
        user_id: users[0].id,
        content: "Excellente contribution, très informatif.",
        status: "APPROVED",
        is_validated: true,
      },
    }),
  ]);

  // Créer des snowledge registers
  await Promise.all([
    prisma.snowledgeRegister.create({
      data: {
        firstName: "Jean",
        lastName: "Dubois",
        email: "jean.dubois@example.com",
        how: "Réseaux sociaux",
        why: "Intéressé par la technologie blockchain",
        language: "fr",
      },
    }),
    prisma.snowledgeRegister.create({
      data: {
        firstName: "Sophie",
        lastName: "Martin",
        email: "sophie.martin@example.com",
        how: "Bouche à oreille",
        why: "Passionnée par les sujets environnementaux",
        language: "fr",
      },
    }),
    prisma.snowledgeRegister.create({
      data: {
        firstName: "Thomas",
        lastName: "Bernard",
        email: "thomas.bernard@example.com",
        how: "Conférence",
        why: "Recherche de communautés d'apprentissage",
        language: "fr",
      },
    }),
  ]);

  console.log("Base de données initialisée avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur lors du seeding :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
