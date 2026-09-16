import React, { useEffect, useRef, useState } from 'react';
import { isContactFormEnabled, supabase } from '../supabaseClient';
import { SITE } from '../data/site';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const FIELD =
  'w-full rounded-xl border border-bone/10 bg-bone/[0.03] px-4 py-3.5 text-sm text-bone placeholder:text-bone/25 outline-none transition-colors duration-300 focus:border-bone/35 focus:bg-bone/[0.05]';

const LABEL = 'mb-2 block font-mono text-[9px] uppercase tracking-[0.24em] text-bone/40';

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus(), 120);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      if (!supabase) throw new Error('The contact form is not configured right now.');

      const { error } = await supabase
        .from('quotes')
        .insert([{ name, email, project_details: details }]);

      if (error) throw error;

      setStatus('success');
      window.setTimeout(() => {
        onClose();
        setName('');
        setEmail('');
        setDetails('');
        setStatus('idle');
      }, 2200);
    } catch (err) {
      console.error('Error sending quote:', err);
      setErrorMsg(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setStatus('error');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start a project"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-obsidian/80 backdrop-blur-md"
        style={{ animation: 'fade-in 320ms ease-out' }}
      />

      <div
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-bone/10 bg-ink p-7 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] md:p-10"
        style={{ animation: 'modal-in 480ms cubic-bezier(0.16,1,0.3,1)' }}
      >
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-bone/[0.06] blur-[70px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-bone/[0.05] blur-[80px]"
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-bone/10 text-bone/50 transition-colors duration-300 hover:border-bone/25 hover:text-bone"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div className="relative z-10">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-bone/25 bg-bone/[0.06]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 text-bone/80">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-light tracking-tight text-bone">
                Message received
              </h3>
              <p className="mt-2 text-sm text-bone/45">I will be in touch shortly.</p>
            </div>
          ) : (
            <>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-bone/35">
                [ New enquiry ]
              </p>
              <h2 className="mt-4 font-display text-2xl font-light leading-tight tracking-tight text-bone md:text-3xl">
                Let's build something
                <br />
                <span className="text-bone/55">worth shipping</span>.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-bone/45">
                A few lines is enough. I will reply from {SITE.email}.
              </p>

              {!isContactFormEnabled ? (
                <a
                  href={'mailto:' + SITE.email}
                  className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-bone/20 bg-bone/[0.05] px-4 py-3.5 text-sm text-bone/75 transition-colors hover:border-bone/35"
                >
                  <span>The form is offline. Email me directly instead.</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/80">
                    Open mail
                  </span>
                </a>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-9 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cm-name" className={LABEL}>
                      Name
                    </label>
                    <input
                      id="cm-name"
                      ref={firstFieldRef}
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={FIELD}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="cm-email" className={LABEL}>
                      Email
                    </label>
                    <input
                      id="cm-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={FIELD}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cm-details" className={LABEL}>
                    What are you building?
                  </label>
                  <textarea
                    id="cm-details"
                    required
                    rows={4}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className={FIELD + ' resize-none'}
                    placeholder="A rough shape of the project, the timeline, anything already decided..."
                  />
                </div>

                {status === 'error' ? (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-300">
                    {errorMsg}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="group relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-bone py-4 font-mono text-[10px] uppercase tracking-[0.26em] text-obsidian transition-opacity disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {status === 'sending' ? 'Sending' : 'Send enquiry'}
                  </span>
                  {status === 'sending' ? (
                    <svg className="relative z-10 h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
                      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative z-10 h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  )}
                  <span className="absolute inset-0 -translate-x-full bg-bone/70 transition-transform duration-500 group-hover:translate-x-0" />
                </button>
              </form>
            </>
          )}
        </div>

        <style>{`
          @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes modal-in {
            from { opacity: 0; transform: translateY(22px) scale(0.97) }
            to { opacity: 1; transform: translateY(0) scale(1) }
          }
        `}</style>
      </div>
    </div>
  );
};

export default ContactModal;
