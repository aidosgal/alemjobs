export const Gilroy = {
  thin: 'Gilroy-Thin',
  ultraLight: 'Gilroy-UltraLight',
  light: 'Gilroy-Light',
  regular: 'Gilroy-Regular',
  medium: 'Gilroy-Medium',
  semibold: 'Gilroy-Semibold',
  bold: 'Gilroy-Bold',
  extrabold: 'Gilroy-Extrabold',
  black: 'Gilroy-Black',
  heavy: 'Gilroy-Heavy',
} as const;

export const gilroyFontAssets = {
  [Gilroy.thin]: require('../../assets/Gilroy-Thin.ttf'),
  [Gilroy.ultraLight]: require('../../assets/Gilroy-UltraLight.ttf'),
  [Gilroy.light]: require('../../assets/Gilroy-Light.ttf'),
  [Gilroy.regular]: require('../../assets/Gilroy-Regular.ttf'),
  [Gilroy.medium]: require('../../assets/Gilroy-Medium.ttf'),
  [Gilroy.semibold]: require('../../assets/Gilroy-Semibold.ttf'),
  [Gilroy.bold]: require('../../assets/Gilroy-Bold.ttf'),
  [Gilroy.extrabold]: require('../../assets/Gilroy-Extrabold.ttf'),
  [Gilroy.black]: require('../../assets/Gilroy-Black.ttf'),
  [Gilroy.heavy]: require('../../assets/Gilroy-Heavy.ttf'),
};
