import { ImageSourcePropType } from 'react-native';
import { normalizeUrl } from './urlHelpers';

export const getImageSource = (
  url: string | null | undefined,
): ImageSourcePropType | undefined => {
  if (!url) return undefined;

  const { uri, headers } = normalizeUrl(url);

  if (Object.keys(headers).length > 0) {
    return {
      uri,
      headers,
    };
  }

  return { uri };
};
