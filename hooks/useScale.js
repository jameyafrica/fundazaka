import { useWindowDimensions } from 'react-native';
 
// The Figma frames are 390 wide. scale(55) returns 55 on a 390px phone and
// grows or shrinks (within limits) on other screen widths.
export function useScale() {
  const { width } = useWindowDimensions();
  const factor = Math.min(Math.max(width / 390, 0.85), 1.2);
  return (size) => Math.round(size * factor);
}