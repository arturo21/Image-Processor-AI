export enum ProcessType {
  REMOVE_BG = 'REMOVE_BG',
  UPSCALE_2X = 'UPSCALE_2X',
  UPSCALE_4X = 'UPSCALE_4X',
}

export enum ViewMode {
  IMAGE_STUDIO = 'IMAGE_STUDIO',
  CAMPAIGN_ENGINE = 'CAMPAIGN_ENGINE',
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0 to 100
  type: ProcessType | null;
  startTime: number;
}

export interface ImageFile {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export interface ProcessedResult {
  originalUrl: string;
  processedUrl: string;
  processType: ProcessType;
  timestamp: number;
}

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
}

export interface CampaignState {
  name: string;
  subject: string;
  purpose: string;
  generatedHtml: string;
  isGenerating: boolean;
  isSending: boolean;
  sentCount: number;
  totalTargets: number;
  logs: string[];
}