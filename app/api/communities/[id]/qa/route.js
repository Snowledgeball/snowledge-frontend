import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");

    const questions = await prisma.community_qa_questions.findMany({
      where: {
        community_id: parseInt(id),
        post_id: postId ? parseInt(postId) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        community_qa_answers: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Restructurer la réponse
    const formattedQuestions = questions.map((question) => ({
      id: question.id,
      question: question.question,
      created_at: question.created_at,
      author: question.user,
      answers: question.community_qa_answers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        created_at: answer.created_at,
        is_accepted: answer.is_accepted,
        author: answer.user,
      })),
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.log("Erreur lors de la récupération des questions:", error.stack);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST /api/communities/[id]/qa
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = await params;

    const { question, postId } = await req.json();

    const newQuestion = await prisma.community_qa_questions.create({
      data: {
        community_id: parseInt(id),
        author_id: parseInt(session.user.id),
        question,
        post_id: postId ? parseInt(postId) : null,
      },
      select: {
        id: true,
        question: true,
        created_at: true,
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
        community_qa_answers: {
          select: {
            id: true,
            content: true,
            created_at: true,
            is_accepted: true,
            user: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    const formattedQuestion = {
      id: newQuestion.id,
      question: newQuestion.question,
      created_at: newQuestion.created_at,
      author: newQuestion.user,
      answers: newQuestion.community_qa_answers.map((answer) => ({
        id: answer.id,
        content: answer.content,
        created_at: answer.created_at,
        is_accepted: answer.is_accepted,
        author: answer.user,
      })),
    };

    return NextResponse.json(formattedQuestion);
  } catch (error) {
    console.log("Erreur lors de la création de la question:", error.stack);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
