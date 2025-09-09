import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreenManager from './src/components/SplashScreenManager';

export default function App(): React.ReactElement {
  return (
    <SplashScreenManager onComplete={() => {}}>
      <AppNavigator />
    </SplashScreenManager>
  );
}
