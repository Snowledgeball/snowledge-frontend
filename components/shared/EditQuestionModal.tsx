import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface EditQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { question: string; category: string }) => Promise<void>;
    initialQuestion: string;
    initialCategory: string;
}

const CATEGORIES = [
    { id: 'general', label: 'Général' },
    { id: 'technique', label: 'Technique' },
    { id: 'business', label: 'Business' },
    { id: 'autre', label: 'Autre' }
];

export default function EditQuestionModal({
    isOpen,
    onClose,
    onSubmit,
    initialQuestion,
    initialCategory
}: EditQuestionModalProps) {
    const [question, setQuestion] = useState(initialQuestion);
    const [category, setCategory] = useState(initialCategory);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit({ question, category });
            onClose();
        } catch (error) {
            console.error('Erreur:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-xl w-full bg-white rounded-xl shadow-lg">
                    <div className="flex items-center justify-between p-6 border-b">
                        <Dialog.Title className="text-lg font-semibold">
                            Modifier la question
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Catégorie
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                required
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Question
                            </label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="Modifiez votre question ici..."
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 hover:text-gray-900"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </form>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
} 