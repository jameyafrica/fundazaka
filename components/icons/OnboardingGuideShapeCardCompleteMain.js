import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingGuideShapeCardCompleteMain = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 654"
    {...props}
  >
    <G filter="url(#onboarding-guide-shape-card-complete-main__svg__a)">
      <Path
        fill="url(#onboarding-guide-shape-card-complete-main__svg__b)"
        fillOpacity={0.8}
        d="M.1 27.1c0-14.912 12.088-27 27-27h277c14.912 0 27 12.088 27 27v599c0 14.912-12.088 27-27 27h-277c-14.912 0-27-12.088-27-27z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-guide-shape-card-complete-main__svg__b"
        x1={-78.4}
        x2={-354.681}
        y1={-251.202}
        y2={340.703}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#015353" />
        <Stop offset={0.548} stopColor="#022" />
        <Stop offset={1} stopColor="#001414" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingGuideShapeCardCompleteMain;
