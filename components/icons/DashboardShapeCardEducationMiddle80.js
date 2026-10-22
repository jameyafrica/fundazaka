import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapeCardEducationMiddle80 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 332 126"
    {...props}
  >
    <G filter="url(#dashboard-shape-card-education-middle-80_svg__a)">
      <Rect
        width={331}
        height={125}
        x={0.1}
        y={0.1}
        fill="url(#dashboard-shape-card-education-middle-80_svg__b)"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-card-education-middle-80_svg__b"
        x1={165.6}
        x2={165.6}
        y1={139.366}
        y2={-18.242}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.58} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapeCardEducationMiddle80;
