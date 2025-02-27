import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';

interface EditAnswerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (content: string) => Promise<void>;
    initialContent: string;
    questionText: string;
}

export default function EditAnswerModal({
    isOpen,
    onClose,
    onSubmit,
    initialContent,
    questionText
}: EditAnswerModalProps) {
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(content);
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
                            Modifier la réponse
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 bg-gray-50 border-b">
                        <p className="text-sm text-gray-600">Question :</p>
                        <p className="text-gray-900 font-medium">{questionText}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Votre réponse
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                placeholder="Modifiez votre réponse ici..."
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