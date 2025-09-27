export enum AppState {
  IDLE,
  ON_SHIFT,
  SHIFT_OVER,
}

export enum ResearchType {
  ECONOMIC = 'economic',
  TRAINING = 'training',
}

export interface InventoryItemData {
  id: string;
  name: string;
  description: string;
  bonus: number; // e.g., 0.02 for 2%
  cost: number;
  icon: string;
}

export interface PartnershipData {
  id: string;
  name: string;
  description: string;
  cost: number;
  dailyIncome: number;
  icon: string;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}
