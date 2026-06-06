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
      content: "Building advanced, reliable, and transformative AI products for forward-thinking businesses.",
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
          icon: "/nxera.png",
          category: "https://www.nxera.io/"
        },
        {
          title: "Zafran Ullah Research",
          description: "Scientific portfolio and research portal for microbiology and molecular biology research.",
          icon: "/zafran.png",
          category: "https://zafranktk.com/"
        },
        {
          title: "ObliQ",
          description: "AI idea generator",
          icon: "/obliq.png",
          category: "https://obliq.netlify.app/"
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