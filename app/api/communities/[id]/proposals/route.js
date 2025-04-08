import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  // Fausses propositions de sujets
  const mockProposals = [
    {
      id: "1",
      title: "Introduction à TypeScript",
      description:
        "Un guide complet pour démarrer avec TypeScript, couvrant les types de base jusqu'aux fonctionnalités avancées.",
      status: "pending",
      createdBy: {
        name: "Alexandre Pascal",
        profilePicture:
          "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeiahrxumqtrj6lmw3rnpzsj6qdfprj4tdbzpvnc5ti4ou2c4uj5n5u",
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 jours avant
      votes: {
        approve: 7,
        reject: 2,
      },
    },
    {
      id: "2",
      title: "Développement React avancé",
      description:
        "Techniques et patterns pour construire des applications React complexes et performantes. Ce sujet couvre les hooks personnalisés, l'optimisation des rendus et les architectures modernes.",
      status: "pending",
      createdBy: {
        name: "Marie Dubois",
        profilePicture:
          "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeidtf3y5opwklmivulgpzcx4b6wnp5p4gl36jbqldmvmszuya5gnpq",
      },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 jours avant
      votes: {
        approve: 12,
        reject: 1,
      },
    },
    {
      id: "3",
      title: "Déploiement avec Docker",
      description:
        "Apprendre à conteneuriser et déployer des applications web modernes avec Docker. Ce guide pratique vous aidera à comprendre les concepts fondamentaux et à mettre en place un workflow efficace.",
      status: "pending",
      createdBy: {
        name: "Thomas Martin",
        profilePicture:
          "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeif2qdm3plbj2zsgskblfybaffzfau7oj56ixi6unjrn6fkgmgdfem",
      },
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 jours avant
      votes: {
        approve: 5,
        reject: 3,
      },
    },
    {
      id: "4",
      title: "API REST avec Node.js",
      description:
        "Comment concevoir et développer des API REST robustes et évolutives avec Node.js et Express. Ce tutoriel couvrira également les bonnes pratiques d'authentification et de sécurité.",
      status: "pending",
      createdBy: {
        name: "Sophie Bernard",
        profilePicture:
          "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeidznpoebhh2yv7aicgkkcnzfie7tbxch6rsjccvueoqzxnvfirsay",
      },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 jours avant
      votes: {
        approve: 9,
        reject: 0,
      },
    },
    {
      id: "5",
      title: "Intelligence Artificielle pour développeurs web",
      description:
        "Introduction aux concepts d'IA appliqués au développement web. Apprenez à intégrer des modèles pré-entraînés et à créer des fonctionnalités intelligentes pour vos applications.",
      status: "pending",
      createdBy: {
        name: "Lucas Petit",
        profilePicture:
          "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeidjnmpwjpdvwbf6auqgcm2mjzn74hy2cu3iovbhfvlwdyexwsrjyu",
      },
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 jour avant
      votes: {
        approve: 15,
        reject: 2,
      },
    },
  ];

  return NextResponse.json(mockProposals);
}

export async function POST(request, { params }) {
  const { id } = params;
  const data = await request.json();

  // Simuler la création d'une nouvelle proposition
  const newProposal = {
    id: Math.floor(Math.random() * 1000).toString(),
    title: data.title,
    description: data.description,
    status: "pending",
    createdBy: {
      name: "Utilisateur actuel",
      profilePicture:
        "https://indigo-hidden-meerkat-77.mypinata.cloud/ipfs/bafybeiahrxumqtrj6lmw3rnpzsj6qdfprj4tdbzpvnc5ti4ou2c4uj5n5u",
    },
    createdAt: new Date(),
    votes: {
      approve: 0,
      reject: 0,
    },
  };

  return NextResponse.json(newProposal);
}
