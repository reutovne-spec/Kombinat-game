import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, ResearchType, ProductionType, TelegramUser } from './types';
import { 
  SHIFT_DURATION_MS, 
  SALARY_AMOUNT, 
  XP_PER_SHIFT, 
  getXpForNextLevel, 
  getDailyRewardAmount,
  RESEARCH_BONUS_PER_LEVEL,
  MAX_RESEARCH_LEVEL,
  getResearchCost,
  getResearchDurationMs,
  INVENTORY_ITEMS,
  PARTNERSHIPS
} from './constants';
import Button from './components/Button';
import Timer from './components/Timer';
import Balance from './components/Balance';
import ExperienceBar from './components/ExperienceBar';
import DailyRewardModal from './components/DailyRewardModal';
import ResearchModal from './components/ResearchModal';
import InventoryModal from './components/InventoryModal';
import PartnershipModal from './components/PartnershipModal';
import ProductionModal from './components/ProductionModal';
import ActionButton from './components/ActionButton';
import UserProfile from './components/UserProfile';
import { supabase } from './lib/supabaseClient';

interface ResearchData {
  level: number;
}

interface Researches {
  [ResearchType.ECONOMIC]: ResearchData;
  [ResearchType.TRAINING]: ResearchData;
}

interface ActiveResearch {
  type: ResearchType;
  endTime: number;
}

interface GameState {
  appState: AppState;
  balance: number;
  level: number;
  experience: number;
  shiftEndTime: number | null;
  dailyStreak: number;
  lastRewardClaimTime: number | null;
  researches: Researches;
  activeResearch: ActiveResearch | null;
  inventory: string[];
  ownedPartnerships: string[];
  lastCollectionTime: number | null;
  production: ProductionType | null;
}

const DEFAULT_GAME_STATE: Omit<GameState, 'appState' | 'dailyStreak' | 'lastRewardClaimTime'> = {
  balance: 0,
  level: 1,
  experience: 0,
  shiftEndTime: null,
  researches: {
    [ResearchType.ECONOMIC]: { level: 0 },
    [ResearchType.TRAINING]: { level: 0 },
  },
  activeResearch: null,
  inventory: [],
  ownedPartnerships: [],
  lastCollectionTime: null,
  production: null,
};

// Helper to ensure we don't load corrupted numerical data (like NaN or Infinity)
const safeGetNumber = (value: unknown, defaultValue: number): number => {
  return typeof value === 'number' && isFinite(value) ? value : defaultValue;
};
const safeGetNumberOrNull = (value: unknown): number | null => {
  return typeof value === 'number' && isFinite(value) ? value : null;
};

interface AppProps {
  user: TelegramUser;
}

const App: React.FC<AppProps> = ({ user }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);
  const [currentDailyReward, setCurrentDailyReward] = useState<number>(0);
  const [unclaimedIncome, setUnclaimedIncome] = useState(0);

  const [showResearchModal, setShowResearchModal] = useState<boolean>(false);
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [showPartnershipModal, setShowPartnershipModal] = useState<boolean>(false);
  const [showProductionModal, setShowProductionModal] = useState<boolean>(false);

  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadGameData = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('game_data')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // Handle actual errors, ignore 'not found'
        console.error("Failed to load game data:", error);
        return;
      }

      const rawData = data?.game_data;

      // Sanitize loaded data or use defaults to ensure stability
      const sanitizedState: GameState = {
        appState: AppState.IDLE,
        balance: safeGetNumber(rawData?.balance, DEFAULT_GAME_STATE.balance),
        level: Math.max(1, safeGetNumber(rawData?.level, DEFAULT_GAME_STATE.level)),
        experience: safeGetNumber(rawData?.experience, DEFAULT_GAME_STATE.experience),
        shiftEndTime: safeGetNumberOrNull(rawData?.shiftEndTime),
        dailyStreak: Math.max(1, safeGetNumber(rawData?.dailyStreak, 1)),
        lastRewardClaimTime: safeGetNumberOrNull(rawData?.lastRewardClaimTime),
        researches: {
          [ResearchType.ECONOMIC]: { level: safeGetNumber(rawData?.researches?.[ResearchType.ECONOMIC]?.level, 0) },
          [ResearchType.TRAINING]: { level: safeGetNumber(rawData?.researches?.[ResearchType.TRAINING]?.level, 0) },
        },
        activeResearch: rawData?.activeResearch || null,
        inventory: Array.isArray(rawData?.inventory) ? rawData.inventory : [],
        ownedPartnerships: Array.isArray(rawData?.ownedPartnerships) ? rawData.ownedPartnerships : [],
        lastCollectionTime: safeGetNumberOrNull(rawData?.lastCollectionTime),
        production: rawData?.production || null,
      };
      
      // If this was a new user, their profile needs to be created with the sanitized (default) state
      if (!data) {
        const { error: upsertError } = await supabase.from('profiles').upsert({ id: user.id, game_data: sanitizedState });
        if (upsertError) {
          console.error("Failed to create profile:", upsertError);
        } else {
          console.log("New profile created with default state.");
        }
      }

      let loadedState = { ...sanitizedState };

      // Check shift status
      if (loadedState.shiftEndTime && loadedState.shiftEndTime > 0) {
        const timeLeft = loadedState.shiftEndTime - Date.now();
        if (timeLeft > 0) {
          loadedState.appState = AppState.ON_SHIFT;
          setRemainingTime(timeLeft);
        } else {
          loadedState.appState = AppState.SHIFT_OVER;
          setRemainingTime(0);
        }
      } else {
        loadedState.appState = AppState.IDLE;
      }

      // Check daily reward
      const lastClaimTime = loadedState.lastRewardClaimTime;
      const savedStreak = loadedState.dailyStreak;
      
      if (!lastClaimTime) {
        const reward = getDailyRewardAmount(1);
        loadedState.dailyStreak = 1;
        setCurrentDailyReward(reward);
        setShowDailyReward(true);
      } else {
        const lastClaimDate = new Date(lastClaimTime);
        const now = new Date();
        lastClaimDate.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = now.getTime() - lastClaimDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
          const newStreak = diffDays === 1 ? savedStreak + 1 : 1;
          const reward = getDailyRewardAmount(newStreak);
          loadedState.dailyStreak = newStreak;
          setCurrentDailyReward(reward);
          setShowDailyReward(true);
        }
      }

      setGameState(loadedState);
    };

    loadGameData();
  }, [user.id]);

  // Debounced effect to save data to Supabase
  useEffect(() => {
    if (!gameState) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ game_data: gameState })
        .eq('id', user.id);
      
      if (error) {
        console.error("Error saving game data:", error);
      }
    }, 1000);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [gameState, user.id]);


  // Effect for shift timer
  useEffect(() => {
    if (gameState?.appState !== AppState.ON_SHIFT || !gameState?.shiftEndTime) return;
    
    const intervalId = setInterval(() => {
      const timeLeft = gameState.shiftEndTime! - Date.now();
      if (timeLeft <= 0) {
        setRemainingTime(0);
        setGameState(prev => prev ? ({ ...prev, appState: AppState.SHIFT_OVER }) : null);
        clearInterval(intervalId);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [gameState?.appState, gameState?.shiftEndTime]);
  
  // Effect for active research
  useEffect(() => {
    if (!gameState?.activeResearch) return;
    const { activeResearch } = gameState;

    const checkResearch = () => {
      if (Date.now() >= activeResearch.endTime) {
        setGameState(prev => {
          if(!prev) return null;
          const newResearches = { ...prev.researches };
          newResearches[activeResearch.type].level++;
          return { ...prev, researches: newResearches, activeResearch: null };
        });
      }
    };
    
    checkResearch();
    const intervalId = setInterval(checkResearch, 5000);
    return () => clearInterval(intervalId);
  }, [gameState?.activeResearch]);

  // Effect for passive income
  useEffect(() => {
    if (!gameState || gameState.ownedPartnerships.length === 0 || gameState.lastCollectionTime === null) {
      setUnclaimedIncome(0);
      return;
    }
    const { ownedPartnerships, lastCollectionTime } = gameState;

    const calculateAndSetIncome = () => {
      const totalDailyIncome = PARTNERSHIPS
        .filter(p => ownedPartnerships.includes(p.id))
        .reduce((sum, p) => sum + p.dailyIncome, 0);
      
      const timeDiffMs = Date.now() - lastCollectionTime;
      const generatedIncome = (timeDiffMs / (24 * 60 * 60 * 1000)) * totalDailyIncome;
      setUnclaimedIncome(generatedIncome);
    };

    calculateAndSetIncome();
    const interval = setInterval(calculateAndSetIncome, 5000);
    return () => clearInterval(interval);
  }, [gameState?.ownedPartnerships, gameState?.lastCollectionTime]);

  const updateState = (updater: (prevState: GameState) => Partial<GameState>) => {
    setGameState(prev => prev ? { ...prev, ...updater(prev) } : null);
  };

  const startShift = useCallback(() => {
    const endTime = Date.now() + SHIFT_DURATION_MS;
    updateState(() => ({
      shiftEndTime: endTime,
      appState: AppState.ON_SHIFT,
    }));
    setRemainingTime(SHIFT_DURATION_MS);
  }, []);

  const claimSalary = useCallback(() => {
    if (!gameState) return;
    const { researches, inventory, experience, level } = gameState;

    const researchBonus = researches[ResearchType.ECONOMIC].level * RESEARCH_BONUS_PER_LEVEL;
    const inventoryBonus = INVENTORY_ITEMS
      .filter(item => inventory.includes(item.id))
      .reduce((sum, item) => sum + item.bonus, 0);

    const totalBonus = 1 + researchBonus + inventoryBonus;
    const finalSalary = Math.round(SALARY_AMOUNT * totalBonus);
    
    const xpBonus = 1 + researches[ResearchType.TRAINING].level * RESEARCH_BONUS_PER_LEVEL;
    const finalXp = Math.round(XP_PER_SHIFT * xpBonus);

    let currentXp = experience + finalXp;
    let currentLevel = level;
    let xpNeeded = getXpForNextLevel(currentLevel);

    while (currentXp >= xpNeeded) {
        currentXp -= xpNeeded;
        currentLevel++;
        xpNeeded = getXpForNextLevel(currentLevel);
    }
    
    updateState(prev => ({
      balance: prev.balance + finalSalary,
      level: currentLevel,
      experience: currentXp,
      shiftEndTime: null,
      appState: AppState.IDLE,
    }));
  }, [gameState]);

  const claimDailyReward = useCallback(() => {
    if (!gameState) return;
    updateState(prev => ({
      balance: prev.balance + currentDailyReward,
      lastRewardClaimTime: Date.now(),
      dailyStreak: prev.dailyStreak,
    }));
    setShowDailyReward(false);
  }, [currentDailyReward, gameState]);

  const startResearch = useCallback((type: ResearchType) => {
    if (!gameState) return;
    const { researches, activeResearch, balance } = gameState;
    const research = researches[type];
    if (research.level >= MAX_RESEARCH_LEVEL || activeResearch) return;
    
    const cost = getResearchCost(research.level + 1);
    if (balance >= cost) {
      const duration = getResearchDurationMs(research.level + 1);
      const endTime = Date.now() + duration;
      updateState(prev => ({
        balance: prev.balance - cost,
        activeResearch: { type, endTime },
      }));
      setShowResearchModal(false);
    }
  }, [gameState]);

  const purchaseItem = useCallback((itemId: string) => {
    if (!gameState) return;
    const item = INVENTORY_ITEMS.find(i => i.id === itemId);
    if (!item || gameState.inventory.includes(itemId) || gameState.balance < item.cost) return;

    updateState(prev => ({
      balance: prev.balance - item.cost,
      inventory: [...prev.inventory, itemId],
    }));
  }, [gameState]);

  const purchasePartnership = useCallback((partnershipId: string) => {
    if (!gameState) return;
    const partnership = PARTNERSHIPS.find(p => p.id === partnershipId);
    if (!partnership || gameState.ownedPartnerships.includes(partnershipId) || gameState.balance < partnership.cost) return;

    updateState(prev => ({
      balance: prev.balance - partnership.cost,
      ownedPartnerships: [...prev.ownedPartnerships, partnershipId],
      lastCollectionTime: prev.ownedPartnerships.length === 0 ? Date.now() : prev.lastCollectionTime,
    }));
  }, [gameState]);

  const claimPassiveIncome = useCallback(() => {
    const incomeToClaim = Math.floor(unclaimedIncome);
    if (incomeToClaim <= 0 || !gameState) return;
    
    updateState(prev => ({
      balance: prev.balance + incomeToClaim,
      lastCollectionTime: Date.now(),
    }));
  }, [unclaimedIncome, gameState]);

  const joinProduction = useCallback((productionType: ProductionType) => {
    if (!gameState?.production) {
      updateState(() => ({ production: productionType }));
      setShowProductionModal(false);
    }
  }, [gameState]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Загрузка данных с комбината...</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (gameState.appState) {
      case AppState.ON_SHIFT:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-semibold text-gray-300">Смена идет</h2>
            <Timer remainingTime={remainingTime} />
            <Button disabled={true} variant="secondary">На смене...</Button>
          </div>
        );
      case AppState.SHIFT_OVER:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold text-green-400">Смена окончена!</h2>
            <p className="text-xl text-gray-400">Можно забрать свою зарплату.</p>
            <Button onClick={claimSalary}>Получить зарплату</Button>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-semibold text-gray-300">Готовы к работе?</h2>
            <p className="text-xl text-gray-400">Смена длится 8 часов.</p>
            <Button onClick={startShift} disabled={showDailyReward}>На смену</Button>
          </div>
        );
    }
  };

  const isModalOpen = showDailyReward || showResearchModal || showInventoryModal || showPartnershipModal || showProductionModal;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-start p-4 pt-8 relative font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-5"></div>
      
      {showDailyReward && <DailyRewardModal onClaim={claimDailyReward} rewardAmount={currentDailyReward} streakDay={gameState.dailyStreak} />}
      {showResearchModal && 
        <ResearchModal 
          onClose={() => setShowResearchModal(false)}
          researches={gameState.researches}
          activeResearch={gameState.activeResearch}
          onStartResearch={startResearch}
          balance={gameState.balance}
        />}
      {showInventoryModal &&
        <InventoryModal
          onClose={() => setShowInventoryModal(false)}
          ownedItemIds={new Set(gameState.inventory)}
          onPurchaseItem={purchaseItem}
          balance={gameState.balance}
        />
      }
      {showPartnershipModal &&
        <PartnershipModal
          onClose={() => setShowPartnershipModal(false)}
          onPurchasePartnership={purchasePartnership}
          onClaimIncome={claimPassiveIncome}
          ownedPartnershipIds={new Set(gameState.ownedPartnerships)}
          unclaimedIncome={unclaimedIncome}
          balance={gameState.balance}
        />
      }
      {showProductionModal &&
        <ProductionModal
          onClose={() => setShowProductionModal(false)}
          currentProduction={gameState.production}
          onJoinProduction={joinProduction}
        />
      }

      <UserProfile user={user} />
      <Balance amount={gameState.balance} />

      <div className="w-full flex flex-col items-center">
        <header className="text-center mb-6 mt-16 sm:mt-8">
          <h1 className="text-6xl font-extrabold text-yellow-400 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
            Комбинат
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Тяжелый труд. Честная оплата.</p>
        </header>

        <ExperienceBar
          level={gameState.level}
          currentXp={gameState.experience}
          xpForNextLevel={getXpForNextLevel(gameState.level)}
        />

        <div className={`w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start transition-filter duration-300 ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
          <main className="lg:col-span-2 w-full bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
            {renderContent()}
          </main>
          
          <aside className="lg:col-span-1 w-full bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700">
              <h3 className="text-xl font-bold text-gray-300 mb-4 text-center border-b-2 border-gray-700 pb-2">Действия</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
                <ActionButton icon="🔬" label="Исследования" onClick={() => setShowResearchModal(true)} disabled={showDailyReward} />
                <ActionButton icon="🎒" label="Инвентарь" onClick={() => setShowInventoryModal(true)} disabled={showDailyReward} />
                <ActionButton icon="🤝" label="Партнерство" onClick={() => setShowPartnershipModal(true)} disabled={showDailyReward} />
                <ActionButton icon="🏭" label="Производство" onClick={() => setShowProductionModal(true)} disabled={showDailyReward} />
              </div>
          </aside>
        </div>
      </div>
      
      <footer className="w-full mt-8 pb-4 text-gray-600 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} Корпорация "ТяжПромСталь". Все права защищены.</p>
      </footer>
    </div>
  );
};

export default App;