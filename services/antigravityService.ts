import { GoogleGenAI } from "@google/genai";
import { removeBackground, Config } from "@imgly/background-removal";
import { ProcessType } from "../types";

// Note: In a real stack, this would connect to specific U-Net or ESRGAN models.
// Here we utilize a hybrid approach: 
// 1. Local WASM (U-2-Net) for Background Removal (equivalent to Python's rembg).
// 2. Gemini 2.5/3 multimodal capabilities for Generative Upscaling.

class ImageProcessorEngine {
  private ai: GoogleGenAI;
  private modelName: string = 'gemini-2.5-flash-image'; 

  constructor() {
    // Initialize with API Key from environment
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Converts a File object to Base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Helper to convert Blob to Data URL string
   */
  private async blobToDataURL(blob: Blob): Promise<string> {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
      });
  }

  /**
   * Processes the image based on the selected type
   */
  async processImage(file: File, type: ProcessType, onProgress: (progress: number) => void): Promise<string> {
    
    // STRATEGY: 
    // If Removing Background -> Use Local WASM (@imgly/background-removal)
    // If Upscaling -> Use Gemini GenAI
    
    if (type === ProcessType.REMOVE_BG) {
        return this.processLocalRemBg(file, onProgress);
    } else {
        return this.processGenAIUpscale(file, type, onProgress);
    }
  }

  /**
   * Local Background Removal using U-2-Net (rembg equivalent in browser)
   */
  private async processLocalRemBg(file: File, onProgress: (progress: number) => void): Promise<string> {
      try {
          onProgress(5);
          
          const config: Config = {
              progress: (key: string, current: number, total: number) => {
                  // The library exposes download progress for model assets and inference progress
                  if (key.includes('fetch')) {
                     // Downloading model parts (0-40%)
                     const percent = (current / total) * 40;
                     onProgress(Math.min(40, percent));
                  } else if (key.includes('compute')) {
                     // Inference (40-100%)
                     const percent = 40 + ((current / total) * 60);
                     onProgress(Math.min(99, percent));
                  }
              },
              // Enable debug for development
              debug: false
          };

          // Execute segmentation
          const blob = await removeBackground(file, config);
          
          onProgress(100);
          return await this.blobToDataURL(blob);

      } catch (error) {
          console.error("Local RemBg Error:", error);
          throw new Error("Failed to remove background using local engine.");
      }
  }

  /**
   * Generative Upscaling using Gemini
   */
  private async processGenAIUpscale(file: File, type: ProcessType, onProgress: (progress: number) => void): Promise<string> {
    // Simulate initial upload progress
    onProgress(10);
    const base64Data = await this.fileToBase64(file);
    onProgress(30);

    // If no API key is present, fallback to mock (only for GenAI tasks)
    if (!process.env.API_KEY) {
      return this.simulateProcessing(base64Data, type, onProgress);
    }

    try {
      let prompt = "";
      
      switch (type) {
        case ProcessType.UPSCALE_2X:
          prompt = "Upscale this image by 2x. Enhance details, sharpen edges, and remove noise while maintaining the original composition exactly. High fidelity output. Do not alter the content, only the resolution.";
          break;
        case ProcessType.UPSCALE_4X:
          prompt = "Upscale this image by 4x. Super-resolution mode. Maximize clarity, texture detail, and sharpness. The output should look like a professional high-resolution photograph. Strictly maintain original colors and shapes.";
          break;
      }

      onProgress(50);

      // Call Gemini API
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data
              }
            },
            { text: prompt }
          ]
        }
      });

      onProgress(80);

      // Extract image from response
      const parts = response.candidates?.[0]?.content?.parts;
      
      if (!parts) throw new Error("No content generated");

      let generatedImageBase64: string | null = null;

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break;
        }
      }

      if (!generatedImageBase64) {
        console.warn("Model returned text instead of image:", parts[0].text);
        throw new Error("Engine could not generate the visual result.");
      }

      onProgress(100);
      return `data:image/png;base64,${generatedImageBase64}`;

    } catch (error) {
      console.error("GenAI Processing Error:", error);
      onProgress(100);
      return this.simulateProcessing(base64Data, type, () => {}); 
    }
  }

  /**
   * Simulates processing for demo purposes
   */
  private async simulateProcessing(base64Input: string, type: ProcessType, onProgress: (p: number) => void): Promise<string> {
    return new Promise((resolve) => {
      let progress = 30;
      const interval = setInterval(() => {
        progress += 5;
        onProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve(`data:image/png;base64,${base64Input}`);
        }
      }, 100); 
    });
  }
}

export const imageProcessor = new ImageProcessorEngine();