export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  about?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description?: string;
  location?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface ExtensionMessage {
  type: 'LINKEDIN_DATA' | 'TAB_CHECK' | 'TAB_FOCUS';
  data?: LinkedInProfile;
  tabId?: number;
}

export enum PageType {
  PROFILE = 'profile',
  JOB = 'job',
  OTHER = 'other'
}