import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgBreakdownAllShapeCardHeroTop = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 140"
    {...props}
  >
    <G filter="url(#breakdown-all-shape-card-hero-top_svg__a)">
      <Path
        fill="url(#breakdown-all-shape-card-hero-top_svg__b)"
        fillOpacity={0.8}
        d="M.1 27.1c0-14.912 12.088-27 27-27h277c14.912 0 27 12.088 27 27v85c0 14.912-12.088 27-27 27h-277c-14.912 0-27-12.088-27-27z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="breakdown-all-shape-card-hero-top_svg__b"
        x1={289.6}
        x2={-15.39}
        y1={24.951}
        y2={221.983}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgBreakdownAllShapeCardHeroTop;
