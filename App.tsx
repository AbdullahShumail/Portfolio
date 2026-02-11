import React, { useState } from 'react';
import { WebsiteData } from './types';
import Preview from './components/Preview';

const INITIAL_WEBSITE: WebsiteData = {
  name: "Abdullah Shumail",
  tagline: "Founder & Full-stack developer",
  theme: {
    primaryColor: "#ffffff",
    secondaryColor: "#101010",
    fontFamily: "Inter",
    borderRadius: "2rem",
    mode: "dark"
  },
  sections: [
    {
      id: "hero-1",
      type: "hero",
      title: "Abdullah Shumail",
      content: "Hi, I'm Abdullah Shumail — building clean, reliable, and scalable digital products for startups and businesses.",
      imageUrl: "https://i.postimg.cc/85zK2Z0H/abdullah-suit.png" 
    },
    {
      id: "projects-1",
      type: "projects",
      title: "Selected Works",
      content: "A compilation of projects reflecting digital innovation and craft.",
      items: [
        { 
          title: "Nxera AI", 
          description: "A leading-edge software solutions partner building scalable websites and modern mobile apps.",
          icon: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2000&auto=format&fit=crop",
          category: "https://www.nxera.io/"
        },
        { 
          title: "Zafran Ullah Research", 
          description: "Scientific portfolio and research portal for microbiology and molecular biology research.",
          icon: "https://images.unsplash.com/photo-1579154273821-39697152011b?q=80&w=2000&auto=format&fit=crop",
          category: "https://zafranktk.com/"
        },
        { 
          title: "Winzee Chat", 
          description: "Real-time messaging platform for remote teams with deep integration.",
          icon: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=2000&auto=format&fit=crop",
          category: "#"
        },
        { 
          title: "Logicify Edu", 
          description: "Scalable EdTech platform for custom learning paths and educational metrics.",
          icon: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=2000&auto=format&fit=crop",
          category: "#"
        }
      ]
    },
    {
      id: "contact-1",
      type: "contact",
      title: "Let's Talk",
      content: "Got a project in mind? Let's collaborate and build something amazing together."
    }
  ]
};

const App: React.FC = () => {
  const [websiteData] = useState<WebsiteData>(INITIAL_WEBSITE);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050505]">
      <Preview data={websiteData} />
    </div>
  );
};

export default App;