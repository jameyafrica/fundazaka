import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingGuideShapeCardTextMiddlebelowCatPill = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 364"
    {...props}
  >
    <G filter="url(#onboarding-guide-shape-card-text-middlebelow-cat-pill_svg__a)">
      <Rect
        width={331}
        height={363}
        x={0.1}
        y={0.1}
        fill="url(#onboarding-guide-shape-card-text-middlebelow-cat-pill_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-guide-shape-card-text-middlebelow-cat-pill_svg__b"
        x1={-49.9}
        x2={198.81}
        y1={-88.333}
        y2={421.752}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#015353" />
        <Stop offset={0.563} stopColor="#022" />
        <Stop offset={1} stopColor="#001313" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingGuideShapeCardTextMiddlebelowCatPill;
