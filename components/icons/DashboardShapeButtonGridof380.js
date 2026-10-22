import * as React from "react";
import Svg, { G, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapeButtonGridof380 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 95 93"
    {...props}
  >
    <G filter="url(#dashboard-shape-button-gridof3-80_svg__a)">
      <Rect
        width={94}
        height={92}
        x={0.1}
        y={0.1}
        fill="url(#dashboard-shape-button-gridof3-80_svg__b)"
        fillOpacity={0.56}
        rx={27}
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-button-gridof3-80_svg__b"
        x1={47.1}
        x2={47.1}
        y1={0.1}
        y2={112.6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.61} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapeButtonGridof380;
