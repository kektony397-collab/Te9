
import React from 'react';
import type { Trip } from '../types';

interface TripCardProps {
  trip: Trip;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const tripDate = new Date(trip.date);

  return (
    <div className="bg-white shadow rounded-lg p-4 flex justify-between items-center">
      <div>
        <p className="font-semibold text-slate-800">
          Trip on {tripDate.toLocaleDateString()} at {tripDate.toLocaleTimeString()}
        </p>
        <p className="text-sm text-slate-500">
          Distance: {trip.distance.toFixed(2)} km
        </p>
         <p className="text-xs text-slate-400 mt-1">
          GPS Points: {trip.gpsPoints.length}
        </p>
      </div>
      <div>
        {trip.synced ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Synced
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Sync
          </span>
        )}
      </div>
    </div>
  );
};
