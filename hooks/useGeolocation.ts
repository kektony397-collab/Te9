
import { useState, useRef, useCallback } from 'react';

interface GeolocationState {
  isTracking: boolean;
  position: GeolocationPosition | null;
  error: GeolocationPositionError | null;
  permissionState: PermissionState | 'not-supported';
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    isTracking: false,
    position: null,
    error: null,
    permissionState: 'prompt',
  });
  const watchId = useRef<number | null>(null);

  const checkPermission = useCallback(async () => {
    if (!('geolocation' in navigator) || !('permissions' in navigator)) {
        setState(s => ({ ...s, permissionState: 'not-supported' }));
        return;
    }
    const status = await navigator.permissions.query({ name: 'geolocation' });
    setState(s => ({...s, permissionState: status.state }));
    status.onchange = () => {
        setState(s => ({ ...s, permissionState: status.state }));
    };
  }, []);

  const startTracking = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState((s) => ({ ...s, error: { message: 'Geolocation not supported' } as GeolocationPositionError }));
      return;
    }

    if (watchId.current !== null) return; // Already tracking

    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((s) => ({ ...s, isTracking: true, position: pos, error: null }));
      },
      (err) => {
        setState((s) => ({ ...s, error: err }));
        stopTracking();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
      setState((s) => ({ ...s, isTracking: false }));
    }
  }, []);

  return { ...state, startTracking, stopTracking, checkPermission };
}
