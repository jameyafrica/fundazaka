import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgOnboardingSuccessShapeCardBannerCenter = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 301 89"
    {...props}
  >
    <G filter="url(#onboarding-success-shape-card-banner-center_svg__a)">
      <Rect
        width={300}
        height={88}
        x={0.1}
        y={0.1}
        fill="url(#onboarding-success-shape-card-banner-center_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-success-shape-card-banner-center_svg__b"
        x1={150.553}
        x2={150.553}
        y1={-26.474}
        y2={119.031}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.53} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingSuccessShapeCardBannerCenter;
