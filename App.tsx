import React, { useState, useEffect, useCallback } from 'react';
import { AppState, ResearchType, TelegramUser } from './types';
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
import UserProfile from './components/UserProfile';

interface AppProps {
  user: TelegramUser;
  onLogout: () => void;
}

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

const App: React.FC<AppProps> = ({ user, onLogout }) => {
  const userId = user.id;

  const getLocalStorageKey = (key: string) => `kombinat_${key}_${userId}`;

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [balance, setBalance] = useState<number>(() => {
    const savedBalance = localStorage.getItem(getLocalStorageKey('balance'));
    return savedBalance ? parseInt(savedBalance, 10) : 0;
  });
  const [level, setLevel] = useState<number>(() => {
    const savedLevel = localStorage.getItem(getLocalStorageKey('level'));
    return savedLevel ? parseInt(savedLevel, 10) : 1;
  });
  const [experience, setExperience] = useState<number>(() => {
    const savedXp = localStorage.getItem(getLocalStorageKey('experience'));
    return savedXp ? parseInt(savedXp, 10) : 0;
  });
  const [shiftEndTime, setShiftEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  
  const [showDailyReward, setShowDailyReward] = useState<boolean>(false);
  const [dailyStreak, setDailyStreak] = useState<number>(1);
  const [currentDailyReward, setCurrentDailyReward] = useState<number>(0);
  
  const [showResearchModal, setShowResearchModal] = useState<boolean>(false);
  const [researches, setResearches] = useState<Researches>(() => {
    const savedResearches = localStorage.getItem(getLocalStorageKey('researches'));
    return savedResearches ? JSON.parse(savedResearches) : {
      [ResearchType.ECONOMIC]: { level: 0 },
      [ResearchType.TRAINING]: { level: 0 },
    };
  });
  const [activeResearch, setActiveResearch] = useState<ActiveResearch | null>(() => {
     const saved = localStorage.getItem(getLocalStorageKey('activeResearch'));
     return saved ? JSON.parse(saved) : null;
  });
  
  const [showInventoryModal, setShowInventoryModal] = useState<boolean>(false);
  const [inventory, setInventory] = useState<Set<string>>(() => {
    const savedInventory = localStorage.getItem(getLocalStorageKey('inventory'));
    return savedInventory ? new Set(JSON.parse(savedInventory)) : new Set();
  });

  const [showPartnershipModal, setShowPartnershipModal] = useState<boolean>(false);
  const [ownedPartnerships, setOwnedPartnerships] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(getLocalStorageKey('ownedPartnerships'));
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [lastCollectionTime, setLastCollectionTime] = useState<number>(() => {
    const saved = localStorage.getItem(getLocalStorageKey('lastCollectionTime'));
    return saved ? parseInt(saved, 10) : Date.now();
  });
  const [unclaimedIncome, setUnclaimedIncome] = useState(0);

  // Effect to initialize state from localStorage on mount and check for daily reward
  useEffect(() => {
    // Check for shift state
    const savedEndTime = localStorage.getItem(getLocalStorageKey('shiftEndTime'));
    if (savedEndTime) {
      const endTime = parseInt(savedEndTime, 10);
      const timeLeft = endTime - Date.now();
      
      setShiftEndTime(endTime);
      if (timeLeft > 0) {
        setAppState(AppState.ON_SHIFT);
        setRemainingTime(timeLeft);
      } else {
        setAppState(AppState.SHIFT_OVER);
        setRemainingTime(0);
      }
    } else {
      setAppState(AppState.IDLE);
    }

    // Check for daily reward streak
    const lastClaimTimeStr = localStorage.getItem(getLocalStorageKey('lastRewardClaimTime'));
    const savedStreak = parseInt(localStorage.getItem(getLocalStorageKey('dailyStreak')) || '1', 10);
    
    if (!lastClaimTimeStr) {
      // First time user, reward is available
      const reward = getDailyRewardAmount(1);
      setDailyStreak(1);
      setCurrentDailyReward(reward);
      setShowDailyReward(true);
      return;
    }

    const lastClaimTime = parseInt(lastClaimTimeStr, 10);
    const lastClaimDate = new Date(lastClaimTime);
    const now = new Date();

    lastClaimDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - lastClaimDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      let newStreak;
      if (diffDays === 1) {
        newStreak = savedStreak + 1;
      } else {
        newStreak = 1;
      }
      const reward = getDailyRewardAmount(newStreak);
      setDailyStreak(newStreak);
      setCurrentDailyReward(reward);
      setShowDailyReward(true);
    }
  }, [userId]);

  // Effect to manage the countdown timer
  useEffect(() => {
    if (appState !== AppState.ON_SHIFT || !shiftEndTime) {
      return;
    }

    const intervalId = setInterval(() => {
      const timeLeft = shiftEndTime - Date.now();
      if (timeLeft <= 0) {
        setRemainingTime(0);
        setAppState(AppState.SHIFT_OVER);
        clearInterval(intervalId);
      } else {
        setRemainingTime(timeLeft);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [appState, shiftEndTime]);
  
  // Effect to check for completed research
  useEffect(() => {
    if (!activeResearch) return;

    const checkResearch = () => {
      if (Date.now() >= activeResearch.endTime) {
        setResearches(prev => {
          const newResearches = { ...prev };
          newResearches[activeResearch.type].level++;
          return newResearches;
        });
        setActiveResearch(null);
      }
    };
    
    checkResearch();
    const intervalId = setInterval(checkResearch, 1000);
    return () => clearInterval(intervalId);
  }, [activeResearch]);

  // Effect to calculate passive income
  useEffect(() => {
    const calculateAndSetIncome = () => {
      if (ownedPartnerships.size === 0) {
        setUnclaimedIncome(0);
        return;
      }
      const totalDailyIncome = PARTNERSHIPS
        .filter(p => ownedPartnerships.has(p.id))
        .reduce((sum, p) => sum + p.dailyIncome, 0);
      
      const timeDiffMs = Date.now() - lastCollectionTime;
      const generatedIncome = (timeDiffMs / (24 * 60 * 60 * 1000)) * totalDailyIncome;
      setUnclaimedIncome(generatedIncome);
    };

    calculateAndSetIncome();
    const interval = setInterval(calculateAndSetIncome, 1000);
    return () => clearInterval(interval);
  }, [ownedPartnerships, lastCollectionTime]);


  // Effects to save data to localStorage
  useEffect(() => { localStorage.setItem(getLocalStorageKey('balance'), balance.toString()); }, [balance, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('level'), level.toString()); }, [level, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('experience'), experience.toString()); }, [experience, userId]);
  useEffect(() => {
    if (shiftEndTime) {
      localStorage.setItem(getLocalStorageKey('shiftEndTime'), shiftEndTime.toString());
    } else {
      localStorage.removeItem(getLocalStorageKey('shiftEndTime'));
    }
  }, [shiftEndTime, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('researches'), JSON.stringify(researches)); }, [researches, userId]);
  useEffect(() => {
    if (activeResearch) {
      localStorage.setItem(getLocalStorageKey('activeResearch'), JSON.stringify(activeResearch));
    } else {
      localStorage.removeItem(getLocalStorageKey('activeResearch'));
    }
  }, [activeResearch, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('inventory'), JSON.stringify(Array.from(inventory))); }, [inventory, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('ownedPartnerships'), JSON.stringify(Array.from(ownedPartnerships))); }, [ownedPartnerships, userId]);
  useEffect(() => { localStorage.setItem(getLocalStorageKey('lastCollectionTime'), lastCollectionTime.toString()); }, [lastCollectionTime, userId]);


  const startShift = useCallback(() => {
    const endTime = Date.now() + SHIFT_DURATION_MS;
    setShiftEndTime(endTime);
    setRemainingTime(SHIFT_DURATION_MS);
    setAppState(AppState.ON_SHIFT);
  }, []);

  const claimSalary = useCallback(() => {
    const researchBonus = researches[ResearchType.ECONOMIC].level * RESEARCH_BONUS_PER_LEVEL;
    const inventoryBonus = INVENTORY_ITEMS
      .filter(item => inventory.has(item.id))
      .reduce((sum, item) => sum + item.bonus, 0);

    const totalBonus = 1 + researchBonus + inventoryBonus;
    const finalSalary = Math.round(SALARY_AMOUNT * totalBonus);
    setBalance(prevBalance => prevBalance + finalSalary);

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

    setLevel(currentLevel);
    setExperience(currentXp);
    
    setShiftEndTime(null);
    setAppState(AppState.IDLE);
  }, [experience, level, researches, inventory]);

  const claimDailyReward = useCallback(() => {
    setBalance(prevBalance => prevBalance + currentDailyReward);
    localStorage.setItem(getLocalStorageKey('lastRewardClaimTime'), Date.now().toString());
    localStorage.setItem(getLocalStorageKey('dailyStreak'), dailyStreak.toString());
    setShowDailyReward(false);
  }, [currentDailyReward, dailyStreak, userId]);
  
  const startResearch = useCallback((type: ResearchType) => {
    const research = researches[type];
    if (research.level >= MAX_RESEARCH_LEVEL || activeResearch) {
      return;
    }

    const cost = getResearchCost(research.level + 1);
    if (balance >= cost) {
      setBalance(prev => prev - cost);
      const duration = getResearchDurationMs(research.level + 1);
      const endTime = Date.now() + duration;
      setActiveResearch({ type, endTime });
      setShowResearchModal(false);
    }
  }, [researches, activeResearch, balance]);
  
  const purchaseItem = useCallback((itemId: string) => {
    const item = INVENTORY_ITEMS.find(i => i.id === itemId);
    if (!item || inventory.has(itemId) || balance < item.cost) {
      return;
    }
    setBalance(prev => prev - item.cost);
    setInventory(prev => new Set(prev).add(itemId));
  }, [balance, inventory]);

  const purchasePartnership = useCallback((partnershipId: string) => {
    const partnership = PARTNERSHIPS.find(p => p.id === partnershipId);
    if (!partnership || ownedPartnerships.has(partnershipId) || balance < partnership.cost) {
        return;
    }
    if (ownedPartnerships.size === 0) {
        setLastCollectionTime(Date.now());
    }
    setBalance(prev => prev - partnership.cost);
    setOwnedPartnerships(prev => new Set(prev).add(partnershipId));
  }, [balance, ownedPartnerships]);

  const claimPassiveIncome = useCallback(() => {
    const incomeToClaim = Math.floor(unclaimedIncome);
    if (incomeToClaim <= 0) return;
    
    setBalance(prev => prev + incomeToClaim);
    setLastCollectionTime(Date.now());
  }, [unclaimedIncome]);


  const renderContent = () => {
    switch (appState) {
      case AppState.ON_SHIFT:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-semibold text-gray-300">Смена идет</h2>
            <Timer remainingTime={remainingTime} />
            <Button onClick={() => {}} disabled={true} variant="secondary">
              На смене...
            </Button>
          </div>
        );
      case AppState.SHIFT_OVER:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-bold text-green-400">Смена окончена!</h2>
            <p className="text-xl text-gray-400">Можно забрать свою зарплату.</p>
            <Button onClick={claimSalary}>
              Получить зарплату
            </Button>
          </div>
        );
      case AppState.IDLE:
      default:
        return (
          <div className="flex flex-col items-center gap-8">
            <h2 className="text-3xl font-semibold text-gray-300">Готовы к работе?</h2>
            <p className="text-xl text-gray-400">Смена длится 8 часов.</p>
            <Button onClick={startShift} disabled={showDailyReward}>
              На смену
            </Button>
          </div>
        );
    }
  };

  const isModalOpen = showDailyReward || showResearchModal || showInventoryModal || showPartnershipModal;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 relative font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre-v2.png')] opacity-5"></div>
      
      {showDailyReward && <DailyRewardModal onClaim={claimDailyReward} rewardAmount={currentDailyReward} streakDay={dailyStreak} />}
      {showResearchModal && 
        <ResearchModal 
          onClose={() => setShowResearchModal(false)}
          researches={researches}
          activeResearch={activeResearch}
          onStartResearch={startResearch}
          balance={balance}
        />}
      {showInventoryModal &&
        <InventoryModal
          onClose={() => setShowInventoryModal(false)}
          ownedItemIds={inventory}
          onPurchaseItem={purchaseItem}
          balance={balance}
        />
      }
      {showPartnershipModal &&
        <PartnershipModal
          onClose={() => setShowPartnershipModal(false)}
          onPurchasePartnership={purchasePartnership}
          onClaimIncome={claimPassiveIncome}
          ownedPartnershipIds={ownedPartnerships}
          unclaimedIncome={unclaimedIncome}
          balance={balance}
        />
      }

      <UserProfile user={user} onLogout={onLogout} />
      <Balance amount={balance} />

      <header className="text-center mb-6">
        <h1 className="text-6xl font-extrabold text-yellow-400 tracking-wider uppercase" style={{ textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
          Комбинат
        </h1>
        <p className="text-gray-400 mt-2 text-lg">Тяжелый труд. Честная оплата.</p>
      </header>

      <ExperienceBar
        level={level}
        currentXp={experience}
        xpForNextLevel={getXpForNextLevel(level)}
      />

      <div className={`w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start transition-filter duration-300 ${isModalOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <main className="lg:col-span-2 w-full bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-700">
          {renderContent()}
        </main>
        
        <aside className="lg:col-span-1 w-full bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-gray-700">
            <h3 className="text-xl font-bold text-gray-300 mb-4 text-center border-b-2 border-gray-700 pb-2">Действия</h3>
            <div className="flex flex-col gap-4">
              <Button onClick={() => setShowResearchModal(true)} variant="secondary" disabled={showDailyReward}>
                Исследования
              </Button>
              <Button onClick={() => setShowInventoryModal(true)} variant="secondary" disabled={showDailyReward}>
                Инвентарь
              </Button>
              <Button onClick={() => setShowPartnershipModal(true)} variant="secondary" disabled={showDailyReward}>
                Партнерство
              </Button>
            </div>
        </aside>
      </div>
      
      <footer className="absolute bottom-4 text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Корпорация "ТяжПромСталь". Все права защищены.</p>
      </footer>
    </div>
  );
};

export default App;
