import React, { useState } from 'react';
import { isContactFormEnabled, supabase } from '../supabaseClient';
import { SITE } from '../data/site';

type Status = 'idle' | 'sending' | 'success' | 'error';

const FIELD =
  'w-full rounded-xl border border-bone/10 bg-bone/[0.04] px-4 py-3.5 text-sm font-medium text-bone placeholder:text-bone/30 outline-none transition-colors duration-300 focus:border-bone/40 focus:bg-bone/[0.06]';

const LABEL = 'mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em] text-bone/45';

/**
 * The enquiry form, on its own so the contact panel and the modal share one
 * implementation. Inserts into the Supabase `quotes` table; falls back to a
 * mailto when the backend is not configured.
 */
const ContactForm: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [details, setDetails] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const submit = async (e: React.FormEvent) => {
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
      setName('');
      setEmail('');
      setDetails('');
    } catch (err) {
      console.error('Error sending quote:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-bone/10 bg-bone/[0.04] px-6 py-10 text-center">
        <p className="text-xl font-bold text-bone">Message received.</p>
        <p className="mt-2 text-sm text-bone/50">I will be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {!isContactFormEnabled ? (
        <a
          href={'mailto:' + SITE.email}
          className="flex items-center justify-between gap-4 rounded-xl border border-bone/20 bg-bone/[0.05] px-4 py-3.5 text-sm font-medium text-bone/75 transition-colors hover:border-bone/35"
        >
          <span>The form is offline. Email me directly instead.</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-bone">Open mail</span>
        </a>
      ) : null}

      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <div>
          <label htmlFor="cf-name" className={LABEL}>
            Name
          </label>
          <input id="cf-name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className={FIELD} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="cf-email" className={LABEL}>
            Email
          </label>
          <input id="cf-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={FIELD} placeholder="you@company.com" />
        </div>
      </div>

      <div>
        <label htmlFor="cf-details" className={LABEL}>
          What are you building?
        </label>
        <textarea id="cf-details" required rows={compact ? 3 : 4} value={details} onChange={(e) => setDetails(e.target.value)} className={FIELD + ' resize-none'} placeholder="A rough shape of the project, the timeline, anything already decided." />
      </div>

      {status === 'error' ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium text-red-300">{errorMsg}</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-xl bg-bone py-4 text-[12px] font-bold uppercase tracking-[0.2em] text-obsidian transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {status === 'sending' ? 'Sending' : 'Send enquiry'}
      </button>
    </form>
  );
};

export default ContactForm;
