import { useState, useEffect, useCallback } from 'react';

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: {
    lat: number;
    lng: number;
  } | null;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// 서울 강남역 좌표 (기본값/폴백)
const DEFAULT_POSITION = {
  lat: 37.4979,
  lng: 127.0276,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    loading: true,
    error: null,
    position: null,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: '이 브라우저에서는 위치 서비스를 지원하지 않습니다.',
        position: DEFAULT_POSITION, // 폴백으로 기본 위치 사용
      });
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          error: null,
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        let errorMessage = '위치를 가져올 수 없습니다.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
        }

        setState({
          loading: false,
          error: errorMessage,
          position: DEFAULT_POSITION, // 폴백으로 기본 위치 사용
        });
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 60000,
      }
    );
  }, [options.enableHighAccuracy, options.timeout, options.maximumAge]);

  useEffect(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    refresh: getCurrentPosition,
    isUsingFallback: state.error !== null && state.position !== null,
  };
}
