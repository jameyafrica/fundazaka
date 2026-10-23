import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapeCardIncome80 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 155 103"
    {...props}
  >
    <G filter="url(#dashboard-shape-card-income-80_svg__a)">
      <Rect
        width={154}
        height={102}
        x={0.1}
        y={0.1}
        fill="url(#dashboard-shape-card-income-80_svg__b)"
        fillOpacity={0.56}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-card-income-80_svg__b"
        x1={77.1}
        x2={77.1}
        y1={113.741}
        y2={-14.867}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.58} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapeCardIncome80;
