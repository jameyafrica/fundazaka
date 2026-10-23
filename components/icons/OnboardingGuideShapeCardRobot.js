import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingGuideShapeCardRobot = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 98 93"
    {...props}
  >
    <G filter="url(#onboarding-guide-shape-card-robot_svg__a)">
      <Rect
        width={97}
        height={92}
        x={0.1}
        y={0.1}
        fill="url(#onboarding-guide-shape-card-robot_svg__b)"
        fillOpacity={0.96}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-guide-shape-card-robot_svg__b"
        x1={15.532}
        x2={204.243}
        y1={102.022}
        y2={-18.016}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={0.159} stopColor="#3EB9B9" stopOpacity={0.868} />
        <Stop offset={0.296} stopColor="#71D4D4" stopOpacity={0.757} />
        <Stop offset={0.572} stopColor="#41BBBB" stopOpacity={0.861} />
        <Stop offset={0.99} stopColor="#033" stopOpacity={0.58} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingGuideShapeCardRobot;
