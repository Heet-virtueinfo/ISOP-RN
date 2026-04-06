import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // If not ready, retry in 500ms (Max 10 retries)
    let retries = 0;
    const interval = setInterval(() => {
      retries++;
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
        clearInterval(interval);
      } else if (retries >= 10) {
        console.warn(
          'Navigation failed after 10 retries - Navigator still not ready',
        );
        clearInterval(interval);
      }
    }, 500);
  }
}
