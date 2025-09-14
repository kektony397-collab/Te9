
import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface StatusIndicatorProps {
    syncQueueCount: number;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ syncQueueCount }) => {
    const isOnline = useOnlineStatus();

    return (
        <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between space-x-4">
            <div className="flex items-center space-x-3">
                <span className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <p className="text-slate-700 font-medium">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <div className="flex items-center space-x-3 text-slate-500">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
                </svg>
                <p>{syncQueueCount} item(s) pending sync</p>
            </div>
        </div>
    );
};
