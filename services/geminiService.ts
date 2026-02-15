
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BabyProfile, Storybook, Lullaby, ParentingAdvice, Toy, ToyInteraction, Friend, FriendMessage, ProductRecommendation } from "../types";

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const msg = error?.message || "";
    if (msg.includes("403") || msg.includes("permission") || msg.includes("Requested entity was not found")) {
      if ((window as any).aistudio?.openSelectKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }
    throw error;
  }
}

/**
 * Transcribes audio from microphone input using Gemini 3 Flash.
 */
export const transcribeAudio = async (audioData: string): Promise<string> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: audioData, mimeType: 'audio/pcm;rate=16000' } },
          { text: "Transcribe this audio message. Return only the text." }
        ]
      }
    });
    return response.text || "";
  });
};

/**
 * Analyzes video for parenting insights using Gemini 3 Pro.
 */
export const analyzeVideo = async (videoData: string, mimeType: string): Promise<string> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { data: videoData, mimeType } },
          { text: "What is happening in this video of a baby? Provide cute observations and developmental insights." }
        ]
      }
    });
    return response.text || "I see a happy moment!";
  });
};

/**
 * Gets search-grounded shopping recommendations for baby products.
 */
export const getShoppingRecommendations = async (profile: BabyProfile, query: string): Promise<{
  advice: string,
  products: ProductRecommendation[],
  sources: any[]
}> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest baby products for ${profile.name} (age ${profile.age}). User request: ${query}. Find the best high-quality and cute options.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            advice: { type: Type.STRING },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['clothing', 'gear', 'educational'] }
                },
                required: ["id", "name", "price", "description", "category"]
              }
            }
          },
          required: ["advice", "products"]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Enrich with generated images for clothing/items
    const productsWithImages = await Promise.all(parsed.products.map(async (p: any) => ({
      ...p,
      imageUrl: await generateSceneImage(`Close up high quality product photo of ${p.name}, luxurious cute baby ${p.category}, soft focus background, pastel colors.`)
    })));

    return { advice: parsed.advice, products: productsWithImages, sources };
  });
};

export const generateStorybook = async (profile: BabyProfile, theme: string, moral: string): Promise<Storybook> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Create a 5-scene storybook for a ${profile.age} year old baby named ${profile.name}. Theme: ${theme}. Moral: ${moral}. voxel style.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            theme: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING }
                },
                required: ["text", "imagePrompt"]
              }
            }
          },
          required: ["title", "theme", "scenes"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `${prompt}. voxel pixel art style, soft lighting, child friendly, high quality 3D render.` }] },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return "https://picsum.photos/400/400";
  });
};

export const generateFruitVideo = async (fruit: string, language: string): Promise<string> => {
  if (!(await (window as any).aistudio.hasSelectedApiKey())) {
    await (window as any).aistudio.openSelectKey();
  }
  return withErrorHandling(async () => {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `A cute 3D voxel ${fruit} dancing happily and singing a nursery rhyme in ${language}.`,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const fetchResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await fetchResponse.blob();
    return URL.createObjectURL(blob);
  });
};

export const generateLullabyLyrics = async (profile: BabyProfile & { mood: string }): Promise<Lullaby> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a soothing 4-line lullaby for ${profile.name} (${profile.age}y). Mood: ${profile.mood}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { lyrics: { type: Type.STRING }, mood: { type: Type.STRING } },
          required: ["lyrics", "mood"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : "";
  });
};

export const generateParentingGuide = async (data: { name: string, age: number, query: string }): Promise<ParentingAdvice> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide advice for the parent of ${data.name} (age ${data.age}). Query: ${data.query}.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            bondingActivity: { type: Type.STRING },
            safetyNote: { type: Type.STRING }
          },
          required: ["summary", "tips", "bondingActivity", "safetyNote"]
        }
      }
    });
    const parsed = JSON.parse(response.text || "{}");
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { ...parsed, groundingSources: sources };
  });
};

export const generateToy = async (type: string, profile: BabyProfile, prompt?: string): Promise<Toy> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a toy for ${profile.name}. Type: ${type}. ${prompt || ""}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            personality: { type: Type.STRING },
            voiceStyle: { type: Type.STRING }
          },
          required: ["id", "name", "personality", "voiceStyle"]
        }
      }
    });
    const toyData = JSON.parse(response.text || "{}");
    return {
      ...toyData,
      type: type as any,
      imageUrl: await generateSceneImage(`Voxel pixel art toy ${toyData.name}, ${type}, cute characters.`),
      status: 'happy'
    };
  });
};

export const getToyInteraction = async (toy: Toy, action: string, profile: BabyProfile): Promise<ToyInteraction> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Toy ${toy.name} reacts to ${profile.name} doing ${action}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            animation: { type: Type.STRING }
          },
          required: ["response", "animation"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};

export const generateFriendMessage = async (friend: Friend, text: string, profile: BabyProfile): Promise<FriendMessage> => {
  return withErrorHandling(async () => {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Friend ${friend.name} talks to ${profile.name} about: ${text}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { text: { type: Type.STRING }, mood: { type: Type.STRING } },
          required: ["text", "mood"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  });
};
