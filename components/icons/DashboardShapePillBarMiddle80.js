import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapePillBarMiddle80 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 86"
    {...props}
  >
    <G filter="url(#dashboard-shape-pill-bar-middle-80_svg__a)">
      <Rect
        width={331}
        height={85}
        x={0.1}
        y={0.1}
        fill="url(#dashboard-shape-pill-bar-middle-80_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-pill-bar-middle-80_svg__b"
        x1={166.1}
        x2={166.1}
        y1={-25.568}
        y2={114.976}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.53} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapePillBarMiddle80;
