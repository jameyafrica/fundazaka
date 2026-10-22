import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgBreakdownAllShapeCardHeroTotalBreakdown = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 135 52"
    {...props}
  >
    <G filter="url(#breakdown-all-shape-card-hero-total-breakdown_svg__a)">
      <Path
        fill="url(#breakdown-all-shape-card-hero-total-breakdown_svg__b)"
        fillOpacity={0.8}
        d="M.1 25.6C.1 11.517 11.517.1 25.6.1h83c14.083 0 25.5 11.417 25.5 25.5s-11.417 25.5-25.5 25.5h-83C11.517 51.1.1 39.683.1 25.6"
      />
    </G>
    <Defs>
      <LinearGradient
        id="breakdown-all-shape-card-hero-total-breakdown_svg__b"
        x1={117.299}
        x2={1.259}
        y1={9.218}
        y2={91.933}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgBreakdownAllShapeCardHeroTotalBreakdown;
