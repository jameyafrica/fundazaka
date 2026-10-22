import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingGuideShapeCardTextTop = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 400"
    {...props}
  >
    <G filter="url(#onboarding-guide-shape-card-text-top_svg__a)">
      <Rect
        width={331}
        height={399}
        x={0.1}
        y={0.1}
        fill="url(#onboarding-guide-shape-card-text-top_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-guide-shape-card-text-top_svg__b"
        x1={-49.9}
        x2={239.033}
        y1={-97.103}
        y2={442.011}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#015353" />
        <Stop offset={0.563} stopColor="#022" />
        <Stop offset={1} stopColor="#001313" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingGuideShapeCardTextTop;
