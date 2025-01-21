import { useWindowDimensions } from 'react-native';

export function useScreenPadding() {
  const { height } = useWindowDimensions();
  return height * 0.05; // 5% of screen height
} 