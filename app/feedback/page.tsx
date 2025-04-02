"use client";

import FeedbackForm from "@/components/shared/FeedbackForm";

export default function FeedbackPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Feedback</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Nous apprécions vos commentaires et suggestions pour améliorer notre
        plateforme. Veuillez prendre un moment pour partager votre expérience
        avec nous.
      </p>
      <div className="max-w-xl mx-auto">
        <FeedbackForm />
      </div>
    </div>
  );
}
