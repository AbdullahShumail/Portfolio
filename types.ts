
export interface WebsiteSection {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'about' | 'contact' | 'footer' | 'projects' | 'skills';
  title: string;
  content: string;
  imagePrompt?: string;
  imageUrl?: string;
  ctaText?: string;
  items?: { title: string; description: string; icon?: string; category?: string }[];
}

export interface WebsiteTheme {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: string;
  mode: 'light' | 'dark';
}

export interface WebsiteData {
  name: string;
  tagline: string;
  sections: WebsiteSection[];
  theme: WebsiteTheme;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}
