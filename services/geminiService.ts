
import { GoogleGenAI, Type } from "@google/genai";
import { WebsiteData } from "../types";

// Always initialize GoogleGenAI with a named parameter using the environment variable API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWebsite = async (prompt: string): Promise<WebsiteData> => {
  // Use gemini-3-pro-preview for complex reasoning tasks like generating structured JSON website layouts.
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a sophisticated, modern minimalist website configuration. 
    Context: The user is Abdullah, an AI analyst and full-stack developer.
    Request: "${prompt}"
    
    Guidelines:
    - Use a premium aesthetic: large typography, high contrast, minimalist "bento-box" grids for skills.
    - If it's a portfolio, emphasize "Impressive Works" and "Skills that fuel my passion".
    - Theme should default to dark mode with elegant accents.
    - Generate 4-6 high-quality sections.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          tagline: { type: Type.STRING },
          theme: {
            type: Type.OBJECT,
            properties: {
              primaryColor: { type: Type.STRING },
              secondaryColor: { type: Type.STRING },
              fontFamily: { type: Type.STRING },
              borderRadius: { type: Type.STRING },
              mode: { type: Type.STRING, enum: ["light", "dark"] }
            },
            required: ["primaryColor", "secondaryColor", "fontFamily", "borderRadius", "mode"]
          },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["hero", "features", "pricing", "testimonials", "about", "contact", "footer", "projects", "skills"] },
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                ctaText: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      icon: { type: Type.STRING },
                      category: { type: Type.STRING }
                    },
                    required: ["title", "description"]
                  }
                }
              },
              required: ["id", "type", "title", "content"]
            }
          }
        },
        required: ["name", "tagline", "theme", "sections"]
      }
    }
  });

  // Extract text directly from the response object as a property.
  return JSON.parse(response.text || '{}') as WebsiteData;
};

export const generateImage = async (imagePrompt: string): Promise<string> => {
  // Use gemini-2.5-flash-image for general image generation and editing tasks.
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `High-quality, professional, minimalist aesthetic: ${imagePrompt}` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  // Find and extract the base64 image data from the response parts.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return `https://picsum.photos/800/450?random=${Math.random()}`;
};
