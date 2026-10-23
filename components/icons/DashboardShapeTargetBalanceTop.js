import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapeTargetBalanceTop = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 115 23"
    {...props}
  >
    <G filter="url(#dashboard-shape-target-balance-top_svg__a)">
      <Rect
        width={114}
        height={22}
        x={0.1}
        y={0.1}
        fill="url(#dashboard-shape-target-balance-top_svg__b)"
        fillOpacity={0.56}
        rx={11}
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-target-balance-top_svg__b"
        x1={57.1}
        x2={57.1}
        y1={24.611}
        y2={-3.128}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.58} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapeTargetBalanceTop;
