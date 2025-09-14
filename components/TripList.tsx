
import React from 'react';
import type { Trip } from '../types';
import { TripCard } from './TripCard';

interface TripListProps {
  trips: Trip[];
}

export const TripList: React.FC<TripListProps> = ({ trips }) => {
  if (trips.length === 0) {
    return (
      <div className="text-center py-10 px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-slate-900">No Trips Recorded</h3>
        <p className="mt-1 text-sm text-slate-500">Start a new trip to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-medium text-slate-900">Your Trips</h2>
        {trips.sort((a,b) => b.date - a.date).map(trip => (
            trip.id && <TripCard key={trip.id} trip={trip} />
        ))}
    </div>
  );
};
