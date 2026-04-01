import React from 'react';
import Toast from 'react-native-toast-message';
import { toastConfig } from './ToastConfig';

const AppToast = () => {
  return <Toast config={toastConfig} visibilityTime={1500} />;
};

export default AppToast;
