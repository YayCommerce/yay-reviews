import { useContext } from 'react';
import { ReviewContext } from '@/providers/review-provider';

export default function useReviewContext() {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReviewContext must be used within a ReviewProvider');
  }
  return context;
}
