import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Fonction pour analyser le FormData
async function parseFormData(request: Request) {
  const formData = await request.formData();
  const email = (formData.get("email") as string) || "";
  const feedback = formData.get("feedback") as string;

  const images: { buffer: Buffer; filename: string; mimetype: string }[] = [];

  // Extraire les images
  for (let i = 0; formData.has(`image${i}`); i++) {
    const file = formData.get(`image${i}`) as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    images.push({
      buffer,
      filename: file.name,
      mimetype: file.type,
    });
  }

  return { email, feedback, images };
}

export async function POST(request: Request) {
  try {
    // Analyser le FormData
    const { email, feedback, images } = await parseFormData(request);

    // Validation des données
    if (!feedback || typeof feedback !== "string") {
      return NextResponse.json(
        { error: "Le feedback ne peut pas être vide" },
        { status: 400 }
      );
    }

    // Si les identifiants sont configurés, utiliser le SMTP configuré
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || "465"),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    // Préparation du contenu de l'email
    const mailOptions = {
      from: "alexandre@snowledgeball.com",
      to: "alexandre@snowledgeball.com",
      subject: "Nouveau feedback reçu sur Snowledge",
      html: `
        <h1>Nouveau feedback reçu</h1>
        <p><strong>Commentaire:</strong> ${feedback}</p>
        ${email ? `<p><strong>Email du contact:</strong> ${email}</p>` : ""}
        ${
          images.length > 0
            ? `<p><strong>Nombre d'images jointes:</strong> ${images.length}</p>`
            : ""
        }
        <p><strong>Date:</strong> ${new Date().toLocaleString("fr-FR")}</p>
      `,
      // Ajouter les pièces jointes
      attachments: images.map((image, index) => ({
        filename: image.filename,
        content: image.buffer,
        contentType: image.mimetype,
      })),
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: "Feedback envoyé avec succès",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi du feedback:", error);
    return NextResponse.json(
      {
        error: "Une erreur est survenue lors de l'envoi du feedback",
      },
      { status: 500 }
    );
  }
}
