
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Header } from './components/Header';
import { TripList } from './components/TripList';
import { TrackerControl } from './components/TrackerControl';
import { StatusIndicator } from './components/StatusIndicator';
import { useGeolocation } from './hooks/useGeolocation';
import { db } from './db/dexie';
import { registerSW } from './services/swRegistration';
import { saveTripLocal } from './services/syncService';
import type { Trip, GPSPoint } from './types';

function App() {
  const { isTracking, position, error, permissionState, startTracking, stopTracking, checkPermission } = useGeolocation();
  const [currentTrip, setCurrentTrip] = useState<Omit<Trip, 'id' | 'synced' | 'serverId'> | null>(null);
  
  const allTrips = useLiveQuery(() => db.trips.toArray(), []);
  const syncQueueCount = useLiveQuery(() => db.syncQueue.count(), 0);

  const lastPointRef = useRef<GPSPoint | null>(null);

  useEffect(() => {
    registerSW();
    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const haversineDistance = (p1: GPSPoint, p2: GPSPoint): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLon = (p2.lon - p1.lon) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.lat * Math.PI / 180) * Math.cos(p2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  useEffect(() => {
    if (isTracking && position) {
      const newPoint: GPSPoint = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        ts: position.timestamp,
      };

      setCurrentTrip(prevTrip => {
        if (!prevTrip) return null;

        const lastPoint = prevTrip.gpsPoints[prevTrip.gpsPoints.length - 1];
        const distanceIncrement = lastPoint ? haversineDistance(lastPoint, newPoint) : 0;
        
        lastPointRef.current = newPoint;

        return {
          ...prevTrip,
          distance: prevTrip.distance + distanceIncrement,
          gpsPoints: [...prevTrip.gpsPoints, newPoint],
        };
      });
    }
  }, [isTracking, position]);

  const handleStartTrip = useCallback(() => {
    setCurrentTrip({
      date: Date.now(),
      distance: 0,
      gpsPoints: [],
    });
    startTracking();
  }, [startTracking]);

  const handleStopTrip = useCallback(async () => {
    stopTracking();
    if (currentTrip && currentTrip.gpsPoints.length > 0) {
      await saveTripLocal(currentTrip);
    }
    setCurrentTrip(null);
    lastPointRef.current = null;
  }, [stopTracking, currentTrip]);
  
  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <StatusIndicator syncQueueCount={syncQueueCount || 0} />
        <TrackerControl 
          isTracking={isTracking}
          startTracking={handleStartTrip}
          stopTracking={handleStopTrip}
          permissionState={permissionState}
          lastPoint={lastPointRef.current}
          error={error}
        />
        <TripList trips={allTrips || []} />
      </main>
    </div>
  );
}

export default App;
