import { InventoryItemData, PartnershipData, ProductionData, ProductionType } from './types';

export const SHIFT_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
export const SALARY_AMOUNT = 100;
export const XP_PER_SHIFT = 100;

// Base rewards for each consecutive day of login streak.
export const DAILY_REWARD_AMOUNTS = [50, 75, 100, 125, 150, 200, 300];

export const getDailyRewardAmount = (streak: number): number => {
  // Streak is 1-based, array is 0-based.
  const index = streak - 1;
  // If streak is longer than the defined rewards, give the max reward.
  if (index >= DAILY_REWARD_AMOUNTS.length) {
    return DAILY_REWARD_AMOUNTS[DAILY_REWARD_AMOUNTS.length - 1];
  }
  return DAILY_REWARD_AMOUNTS[index];
};


export const getXpForNextLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(level, 1.5));
};

// Research Constants
export const MAX_RESEARCH_LEVEL = 10;
export const RESEARCH_BONUS_PER_LEVEL = 0.05; // 5% bonus per level

const BASE_RESEARCH_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const BASE_RESEARCH_COST = 500;

export const getResearchDurationMs = (level: number): number => {
  if (level > MAX_RESEARCH_LEVEL) return Infinity;
  // Each level takes 50% longer than the previous one
  return Math.floor(BASE_RESEARCH_DURATION_MS * Math.pow(1.5, level - 1));
};

export const getResearchCost = (level: number): number => {
  if (level > MAX_RESEARCH_LEVEL) return Infinity;
  // Each level costs 2.5 times more than the previous one
  return Math.floor(BASE_RESEARCH_COST * Math.pow(2.5, level - 1));
};

// Inventory Items
export const INVENTORY_ITEMS: InventoryItemData[] = [
  { id: 'gloves', name: 'Рабочие перчатки', description: '+2% к зарплате', bonus: 0.02, cost: 250, icon: '🧤' },
  { id: 'helmet', name: 'Новая каска', description: '+3% к зарплате', bonus: 0.03, cost: 500, icon: '👷' },
  { id: 'boots', name: 'Прочные ботинки', description: '+5% к зарплате', bonus: 0.05, cost: 1200, icon: '🥾' },
  { id: 'tools', name: 'Улучшенный инструмент', description: '+7% к зарплате', bonus: 0.07, cost: 3000, icon: '🛠️' },
  { id: 'thermos', name: 'Современный термос', description: '+10% к зарплате', bonus: 0.10, cost: 7500, icon: '☕' },
  { id: 'transport', name: 'Личный транспорт', description: '+15% к зарплате', bonus: 0.15, cost: 20000, icon: '🚗' },
];

// Partnerships
export const PARTNERSHIPS: PartnershipData[] = [
  { id: 'scrap', name: 'Пункт металлолома', description: 'Ежедневный доход', cost: 10000, dailyIncome: 200, icon: '⚙️' },
  { id: 'taxi', name: 'Таксопарк', description: 'Ежедневный доход', cost: 50000, dailyIncome: 1100, icon: '🚕' },
  { id: 'shipping', name: 'Грузоперевозки', description: 'Ежедневный доход', cost: 200000, dailyIncome: 4500, icon: '🚚' },
  { id: 'market', name: 'Маркет спецодежды', description: 'Ежедневный доход', cost: 800000, dailyIncome: 18000, icon: '👕' },
];

// Productions
export const PRODUCTIONS: ProductionData[] = [
  { id: ProductionType.SINTER, name: 'Аглодоменное', description: 'Основа комбината, производство агломерата и чугуна.', icon: '🏭' },
  { id: ProductionType.STEEL, name: 'Сталеплавильное', description: 'Сердце комбината, здесь чугун превращается в сталь.', icon: '🔥' },
  { id: ProductionType.COKE, name: 'Коксохимическое', description: 'Обеспечивает комбинат топливом - коксом.', icon: '💨' },
];