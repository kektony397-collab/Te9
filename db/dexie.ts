
import Dexie, { type Table } from 'dexie';
import type { Trip, SyncQueueItem } from '../types';

export class AppDB extends Dexie {
  trips!: Table<Trip, number>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('BikeAdvanceDB');
    this.version(1).stores({
      trips: '++id, date, synced, serverId',
      syncQueue: '++id, type, payload, createdAt'
    });
  }
}

export const db = new AppDB();
