export interface Contest {
  id: string;
  name: string;
  description?: string;
  deadline: string;
  isActive: boolean;
}

export interface PickemChoice {
  id: string;
  text: string;
  description?: string;
  userId?: string;
  nickname?: string;
}

export interface Category {
  id: string;
  name: string;
  sortOrder?: number;
}

export interface Pickem {
  id: string;
  question?: string;
  category: Category;
  contestId: string;
  choices: PickemChoice[];
  correctChoiceId?: string;
}

export interface User {
  id: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  points: number;
} 