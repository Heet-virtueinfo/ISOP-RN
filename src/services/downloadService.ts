import ReactNativeBlobUtil from 'react-native-blob-util';
import { Platform, NativeModules } from 'react-native';
import Toast from 'react-native-toast-message';

const isNativeModuleAvailable = !!NativeModules.ReactNativeBlobUtil;

export const downloadFile = async (url: string, fileName: string) => {
  try {
    if (!isNativeModuleAvailable) {
      console.error('[Download] Native module "ReactNativeBlobUtil" is not available.');
      Toast.show({
        type: 'error',
        text1: 'Download Unavailable',
        text2: 'Please rebuild the app to enable downloads.',
      });
      return null;
    }

    const { dirs } = ReactNativeBlobUtil.fs;
    // On Android, use the public Downloads directory
    const dirToSave = Platform.OS === 'ios'
      ? dirs.DocumentDir
      : '/storage/emulated/0/Download';

    // Sanitize filename and ensure extension
    const cleanFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_');
    const rawExtension = url.split('/').pop()?.split('?')[0]?.split('.')?.pop();
    const extension = rawExtension && rawExtension.length <= 5 ? rawExtension : 'pdf';
    const filePath = `${dirToSave}/${cleanFileName}.${extension}`;

    Toast.show({
      type: 'info',
      text1: 'Starting Download',
      text2: `Saving "${cleanFileName}"...`,
    });

    // Use direct fetch with browser mimicking headers
    const res = await ReactNativeBlobUtil.config({
      path: filePath,
      followRedirect: true,
    }).fetch('GET', url, {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 10; SM-A205U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Mobile Safari/537.36',
      Accept: '*/*',
    });

    const status = res.info().status;

    if (status >= 200 && status < 300) {
      if (Platform.OS === 'android') {
        // Register with Download Manager so it appears in the system
        ReactNativeBlobUtil.fs.scanFile([{ path: filePath, mime: `application/${extension}` }]);
      } else {
        ReactNativeBlobUtil.ios.previewDocument(res.path());
      }

      Toast.show({
        type: 'success',
        text1: 'Download Complete ✓',
        text2: `"${cleanFileName}" saved to Downloads.`,
      });
    } else {
      throw new Error(`Server returned status ${status}`);
    }

    return filePath;
  } catch (error: any) {
    console.error('[Download] Error:', error);
    Toast.show({
      type: 'error',
      text1: 'Download Failed',
      text2: 'Could not download. Please re-upload the file in Admin.',
    });
    throw error;
  }
};
