export type ShapeKind = 'rail' | 'ring' | 'frame' | 'grid' | 'orbit';

export interface Project {
  /** Two-digit index shown in the card gutter, e.g. "01". */
  index: string;
  title: string;
  role: string;
  description: string;
  /** Path or URL of the cover image. */
  image: string;
  /** Live link. Use '#' when there is nothing to link to yet. */
  href: string;
  year: string;
  tags: string[];
}

export interface Capability {
  index: string;
  title: string;
  body: string;
  /** Bullet items rendered as small monospace chips. */
  points: string[];
  /** Tailwind col-span hint for the bento grid. */
  span: 'wide' | 'tall' | 'normal';
  accent: 'ember' | 'plasma';
}

export interface StackGroup {
  label: string;
  items: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface SiteContent {
  name: string;
  shortName: string;
  roles: string[];
  location: string;
  email: string;
  hero: {
    eyebrow: string;
    lead: string;
  };
  about: {
    eyebrow: string;
    headline: string;
    body: string[];
    stats: Stat[];
    /** Full-bleed image sitting behind the about section. Empty renders a plain ground. */
    backgroundImage: string;
    /** Small "currently" line. */
    now: string;
  };
  capabilities: Capability[];
  projects: Project[];
  stack: StackGroup[];
  social: { label: string; short: string; href: string }[];
}
