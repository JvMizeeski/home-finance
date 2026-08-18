import React, { createContext, useContext, useState } from 'react';

const VALID_PINS = ['1503', '3215'];
const STORAGE_KEY = 'home_finance_pin_unlocked';

interface PinLockContextType {
  isUnlocked: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
}

const PinLockContext = createContext<PinLockContextType | undefined>(undefined);

export const PinLockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    () => localStorage.getItem(STORAGE_KEY) === 'true'
  );

  const unlock = (pin: string): boolean => {
    if (VALID_PINS.includes(pin)) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setIsUnlocked(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsUnlocked(false);
  };

  return (
    <PinLockContext.Provider value={{ isUnlocked, unlock, lock }}>
      {children}
    </PinLockContext.Provider>
  );
};

export const usePinLock = () => {
  const context = useContext(PinLockContext);
  if (!context) {
    throw new Error("usePinLock must be used within a PinLockProvider");
  }
  return context;
};
