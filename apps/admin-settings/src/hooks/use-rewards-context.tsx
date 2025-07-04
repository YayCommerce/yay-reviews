import { useContext } from 'react';
import { RewardsContext } from '@/providers/rewards-provider';

export default function useRewardsContext() {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewardsContext must be used within a RewardsProvider');
  }
  return context;
}
