import { SiteContent } from '../types';

/**
 * Single source of truth for every word and link on the site.
 * Edit here — no component hard-codes copy.
 */
export const SITE: SiteContent = {
  name: 'Abdullah Shumail',
  shortName: 'Abdullah S.',
  roles: ['AI Engineer', 'Full-Stack Developer', 'Founder'],
  location: 'Pakistan — Working remotely',

  // Public contact address. Swap this if you would rather not publish your inbox.
  email: 'abdullahshumail@gmail.com',

  hero: {
    eyebrow: 'Portfolio — 2026',
    lead:
      'I build intelligent products end to end. Models, pipelines, interfaces, and the unglamorous plumbing that holds them together.',
  },

  about: {
    eyebrow: 'Profile',
    headline: 'I sit where the model meets the interface.',
    body: [
      'Most teams can train something or ship something. The gap between those two is where projects quietly die — the retrieval that degrades, the latency nobody budgeted for, the interface that hides a good answer behind a bad experience.',
      'That gap is my work. I take an idea from a raw prompt to a production surface people actually use, and I own every layer in between.',
    ],
    stats: [
      { value: '5+', label: 'Years building' },
      { value: '4', label: 'Products shipped' },
      { value: '∞', label: 'Refactors survived' },
    ],
    // Drop your image in /public and point this at it, e.g. '/about-bg.jpg'.
    // While empty the section renders on the plain ground, which still looks
    // intentional rather than broken.
    backgroundImage: '',
    now: 'Building at Nxera AI',
  },

  capabilities: [
    {
      index: '01',
      title: 'AI Engineering',
      body:
        'Applied systems built on top of frontier models — retrieval, agents, evaluation, and the guardrails that keep them honest in production.',
      points: ['LLM applications', 'RAG pipelines', 'Agentic workflows', 'Prompt & eval design'],
      span: 'wide',
      accent: 'ember',
    },
    {
      index: '02',
      title: 'Full-Stack',
      body: 'Typed, fast, and maintainable. React on the front, real data underneath.',
      points: ['React & TypeScript', 'Node APIs', 'Postgres / Supabase', 'Edge deployment'],
      span: 'normal',
      accent: 'plasma',
    },
    {
      index: '03',
      title: 'Interface Craft',
      body: 'Motion, type, and restraint. Interfaces that feel considered rather than decorated.',
      points: ['Design systems', 'Canvas & WebGL', 'Micro-interaction', 'Accessibility'],
      span: 'normal',
      accent: 'ember',
    },
    {
      index: '04',
      title: 'Product & Delivery',
      body:
        'Scoping, shipping, and iterating with clients directly — from the first call to the deploy that matters.',
      points: ['Discovery', 'Architecture', 'Client delivery', 'Iteration'],
      span: 'wide',
      accent: 'plasma',
    },
  ],

  projects: [
    {
      index: '01',
      title: 'Nxera AI',
      role: 'Founder & Lead Engineer',
      description:
        'A software solutions studio building scalable websites and modern mobile apps for teams that need to move fast without breaking their stack.',
      image: '/nxera.png',
      href: 'https://www.nxera.io/',
      year: '2025',
      tags: ['Product', 'Full-Stack', 'Studio'],
    },
    {
      index: '02',
      title: 'Zafran Ullah Research',
      role: 'Design & Development',
      description:
        'A scientific portfolio and research portal for microbiology and molecular biology work — publications, methods, and findings in one clean archive.',
      image: '/zafran.png',
      href: 'https://zafranktk.com/',
      year: '2025',
      tags: ['Research', 'Web', 'Editorial'],
    },
    {
      index: '03',
      title: 'ObliQ',
      role: 'AI Engineering',
      description:
        'An AI idea generator that turns a vague premise into a set of sharp, buildable directions instead of the usual generic list.',
      image: '/obliq.png',
      href: 'https://obliq.netlify.app/',
      year: '2025',
      tags: ['AI', 'LLM', 'Product'],
    },
    {
      index: '04',
      title: 'Logicify Edu',
      role: 'Architecture & Build',
      description:
        'A scalable EdTech platform for custom learning paths, progress tracking, and the educational metrics that tell you whether any of it worked.',
      image: '/aicca.png',
      href: '#',
      year: '2024',
      tags: ['EdTech', 'Platform', 'Data'],
    },
  ],

  stack: [
    { label: 'Languages', items: ['TypeScript', 'Python', 'SQL', 'JavaScript'] },
    { label: 'Frontend', items: ['React', 'Next.js', 'Tailwind', 'Vite', 'Canvas'] },
    { label: 'Backend', items: ['Node', 'Supabase', 'Postgres', 'REST', 'Edge Functions'] },
    { label: 'AI', items: ['Gemini', 'OpenAI', 'Embeddings', 'Vector search', 'RAG'] },
  ],

  social: [
    { label: 'GitHub', short: 'GH', href: 'https://github.com/AbdullahShumail' },
    { label: 'LinkedIn', short: 'LN', href: 'https://www.linkedin.com/in/abdullah-shumail/' },
  ],
};
