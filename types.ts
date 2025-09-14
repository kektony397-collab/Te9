
export interface GPSPoint {
  lat: number;
  lon: number;
  ts: number;
}

export interface Trip {
  id?: number;
  date: number;
  distance: number;
  gpsPoints: GPSPoint[];
  synced: boolean;
  serverId?: string | null;
}

export interface SyncQueueItem {
    id?: number;
    type: 'UPLOAD_TRIP';
    payload: { localId: number };
    createdAt: number;
}
