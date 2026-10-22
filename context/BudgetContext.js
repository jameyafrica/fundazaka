import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isResetDue } from '../utils/resetDate';

const BudgetContext = createContext();

const initialState = {
  hydrated: false,
  user: null,
  isGuest: false,
  displayName: '',
  onboardingCompleted: false,
  tourCompleted: false,
  resetPending: false,
  resetDay: null,
  categories: [],
  transactions: [],
  monthlyReports: [],
  cycleStartedAt: null,
};

export function BudgetProvider({ children }) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    async function loadState() {
      try {
        const saved = await AsyncStorage.getItem('fundazaka_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          
          // Check if reset is due upon loading
          let pending = parsed.resetPending || false;
          if (parsed.resetDay && parsed.cycleStartedAt) {
             pending = pending || isResetDue(parsed.resetDay, parsed.cycleStartedAt);
          }
          
          setState({ ...initialState, ...parsed, resetPending: pending, hydrated: true });
        } else {
          setState({ ...initialState, hydrated: true });
        }
      } catch (e) {
        console.error("Failed to load state", e);
        setState({ ...initialState, hydrated: true });
      }
    }
    loadState();
  }, []);

  const updateState = async (updates) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      AsyncStorage.setItem('fundazaka_state', JSON.stringify(next)).catch(console.error);
      return next;
    });
  };

  const startGuest = () => updateState({ isGuest: true, user: { id: 'guest' } });
  const saveSetup = (categories, resetDay) => updateState({ 
    categories, 
    resetDay, 
    cycleStartedAt: new Date().toISOString(),
    onboardingCompleted: true 
  });
  
  // TODO: Add signIn, signOut, logIncome, payExpense, runReset

  return (
    <BudgetContext.Provider value={{ ...state, updateState, startGuest, saveSetup }}>
      {children}
    </BudgetContext.Provider>
  );
}

export const useBudget = () => useContext(BudgetContext);