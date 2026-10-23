import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingExpensesShapeCard = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 301 70"
    {...props}
  >
    <G filter="url(#onboarding-expenses-shape-card_svg__a)">
      <Rect
        width={300}
        height={69}
        x={0.1}
        y={0.1}
        fill="url(#onboarding-expenses-shape-card_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-expenses-shape-card_svg__b"
        x1={150.553}
        x2={150.553}
        y1={-20.736}
        y2={93.353}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.53} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingExpensesShapeCard;
