import { GoogleGenAI, Type } from "@google/genai";
import { ItemType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateVisionAssets = async (topic: string): Promise<{ type: ItemType, content: string, color?: string }[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return [
      { type: ItemType.NOTE, content: "Please configure your API Key", color: "#FECACA" }
    ];
  }

  const results: { type: ItemType, content: string, color?: string }[] = [];

  try {
    // 1. Generate an Image based on the topic
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high quality, aesthetic, pinterest-style photography image representing the vision board topic: ${topic}. Soft lighting, inspiring.` }]
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4", 
        }
      }
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        results.push({
          type: ItemType.IMAGE,
          content: `data:image/png;base64,${part.inlineData.data}`
        });
      }
    }

    // 2. Generate a Quote and Color Palette
    const textResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `For the vision board topic "${topic}", provide:
      1. A short, powerful, inspiring quote (max 15 words).
      2. A hex color code that matches the mood.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            hexColor: { type: Type.STRING }
          }
        }
      }
    });

    if (textResponse.text) {
      const data = JSON.parse(textResponse.text);
      if (data.quote) {
        results.push({
          type: ItemType.QUOTE,
          content: data.quote,
          color: "#ffffff"
        });
      }
      if (data.hexColor) {
         results.push({
            type: ItemType.NOTE,
            content: topic.toUpperCase(),
            color: data.hexColor
         });
      }
    }

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    results.push({ type: ItemType.NOTE, content: "Error generating content. Try again.", color: "#fee2e2" });
  }

  return results;
};

export const generatePlan = async (goals: string[]) => {
    if (!apiKey) return "API Key missing.";
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Create a concise, bullet-point monthly action plan for 2026 to achieve these goals: ${goals.join(', ')}. Keep it motivating and under 150 words.`
        });
        return response.text;
    } catch (e) {
        return "Could not generate plan.";
    }
}

// New function for the 20-block grid
export const generateGridAssets = async (topic: string): Promise<{ type: ItemType, content: string, color?: string }[]> => {
    if (!apiKey) return [];

    const items: { type: ItemType, content: string, color?: string }[] = [];

    try {
        // 1. Plan the grid layout
        const planResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Plan a 20-block vision board aesthetic grid for "${topic}".
            Return a JSON object with a list of exactly 20 items.
            Each item must have a 'type' of either "image_prompt", "quote", "word", or "color".
            - Include exactly 4 "image_prompt" items describing specific aesthetic photos.
            - Include 6 "quote" items (short inspiring quotes).
            - Include 4 "word" items (single powerful words).
            - Include 6 "color" items (hex codes for aesthetic filler blocks).
            `,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING },
                                    value: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const plan = JSON.parse(planResponse.text || "{}").items || [];

        // 2. Process items
        // We will execute image generation in parallel for the image prompts
        const imagePromises = plan
            .filter((p: any) => p.type === 'image_prompt')
            .map((p: any) => ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: p.value + " aesthetic style" }] },
                config: { imageConfig: { aspectRatio: "1:1" } }
            }));
        
        const imageResults = await Promise.all(imagePromises);

        let imgIndex = 0;
        for (const item of plan) {
            if (item.type === 'image_prompt') {
                const res = imageResults[imgIndex];
                imgIndex++;
                const base64 = res.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
                if (base64) {
                    items.push({
                        type: ItemType.IMAGE,
                        content: `data:image/png;base64,${base64}`
                    });
                } else {
                    // Fallback if image fails
                    items.push({ type: ItemType.SHAPE, content: "", color: "#e5e7eb" }); 
                }
            } else if (item.type === 'quote') {
                items.push({ type: ItemType.QUOTE, content: item.value });
            } else if (item.type === 'word') {
                items.push({ type: ItemType.TEXT, content: item.value });
            } else if (item.type === 'color') {
                items.push({ type: ItemType.SHAPE, content: "", color: item.value });
            }
        }
    } catch (e) {
        console.error("Grid generation failed", e);
    }
    return items;
}