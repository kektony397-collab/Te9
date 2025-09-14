
import React from 'react';
import type { GPSPoint } from '../types';

interface TrackerControlProps {
    isTracking: boolean;
    startTracking: () => void;
    stopTracking: () => void;
    permissionState: PermissionState | 'not-supported';
    lastPoint: GPSPoint | null;
    error: GeolocationPositionError | null;
}

export const TrackerControl: React.FC<TrackerControlProps> = ({ isTracking, startTracking, stopTracking, permissionState, lastPoint, error }) => {

    const renderStatus = () => {
        if (permissionState === 'denied') {
            return <p className="text-sm text-red-600">Location access denied. Please enable it in your browser settings.</p>
        }
        if (isTracking) {
             return <p className="text-sm text-green-600 animate-pulse">Tracking active...</p>
        }
        if (permissionState === 'prompt') {
            return <p className="text-sm text-slate-500">Ready to track. Click "Start Trip" to begin.</p>
        }
        return <p className="text-sm text-slate-500">Ready to track.</p>
    }

    return (
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-slate-900">Trip Tracker</h2>
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    disabled={permissionState === 'denied' || permissionState === 'not-supported'}
                    className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${isTracking ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {isTracking ? 'Stop Trip' : 'Start Trip'}
                </button>
            </div>
            
            <div className="bg-slate-50 rounded-md p-4 space-y-2 text-center">
               {renderStatus()}
                {error && <p className="text-sm text-red-500">Error: {error.message}</p>}
                {isTracking && lastPoint && (
                    <div className="text-xs text-slate-600 grid grid-cols-2 gap-2 pt-2">
                        <p>Latitude: {lastPoint.lat.toFixed(6)}</p>
                        <p>Longitude: {lastPoint.lon.toFixed(6)}</p>
                    </div>
                )}
            </div>
             <div className="text-xs text-center text-slate-400 pt-2">
                <p>
                    <span className="font-semibold">Note:</span> Background GPS tracking is unreliable in web browsers. For best results, keep this app in the foreground.
                </p>
                <p>For robust background tracking, a native app solution (e.g., via Capacitor) is recommended.</p>
            </div>
        </div>
    );
}
