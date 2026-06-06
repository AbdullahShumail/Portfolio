import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { WebsiteData } from '../types';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: WebsiteData['theme'];
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, theme }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('idle');

        try {
            const { error } = await supabase
                .from('quotes')
                .insert([{ name, email, project_details: details }]);

            if (error) throw error;

            setStatus('success');
            setTimeout(() => {
                onClose();
                setName('');
                setEmail('');
                setDetails('');
                setStatus('idle');
            }, 2000);
        } catch (error) {
            console.error('Error sending quote:', error);
            setStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDark = theme.mode === 'dark';
    const bgColor = isDark ? 'bg-zinc-900' : 'bg-white';
    const textColor = isDark ? 'text-white' : 'text-zinc-900';
    const inputBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
    const borderColor = isDark ? 'border-zinc-700' : 'border-zinc-200';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-lg ${bgColor} rounded-2xl p-8 shadow-2xl transform transition-all scale-100 opacity-100 border ${borderColor}`}>
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800/50 transition-colors ${textColor}`}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h2 className={`text-3xl font-black tracking-tight mb-2 ${textColor}`}>
                    Let's build together
                </h2>
                <p className={`mb-8 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Tell me about your project and I'll get back to you with a quote.
                </p>

                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className={`text-xl font-bold ${textColor} mb-2`}>Message Sent!</h3>
                        <p className="text-zinc-400">I'll be in touch shortly.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${borderColor} border focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all ${textColor}`}
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${borderColor} border focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all ${textColor}`}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className={`block text-sm font-medium mb-1.5 ${textColor}`}>Project Details</label>
                            <textarea
                                required
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                rows={4}
                                className={`w-full px-4 py-3 rounded-xl ${inputBg} ${borderColor} border focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all resize-none ${textColor}`}
                                placeholder="I need a website for..."
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2`}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Sending...
                                </>
                            ) : 'Send Request'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactModal;
