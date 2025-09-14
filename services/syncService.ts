
import { db } from '../db/dexie';
import { tryRegisterSync } from './swRegistration';
import type { Trip } from '../types';

export async function saveTripLocal(trip: Omit<Trip, 'id' | 'synced' | 'serverId'>) {
  try {
    const tripToSave: Omit<Trip, 'id' | 'serverId'> = { ...trip, synced: false };
    const id = await db.trips.add(tripToSave as Trip);
    console.log(`Trip with local id ${id} saved.`);
    await db.syncQueue.add({ type: 'UPLOAD_TRIP', payload: { localId: id }, createdAt: Date.now() });
    
    // The service worker will handle sync, but we can give it a nudge
    await tryRegisterSync();
    
    // You could also trigger an immediate sync attempt here if online,
    // but relying on the SW's sync event is more robust.
    if (navigator.onLine) {
       console.log("Online, sync will be attempted by service worker.");
    }
    return id;
  } catch(error) {
    console.error("Failed to save trip locally:", error);
    return null;
  }
}
