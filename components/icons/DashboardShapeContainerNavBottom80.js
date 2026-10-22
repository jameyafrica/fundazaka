import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgDashboardShapeContainerNavBottom80 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 390 68"
    {...props}
  >
    <G filter="url(#dashboard-shape-container-nav-bottom-80_svg__a)">
      <Path
        fill="url(#dashboard-shape-container-nav-bottom-80_svg__b)"
        fillOpacity={0.8}
        d="M0 67.1h390v-40c0-14.912-12.088-27-27-27H27C12.088.1 0 12.188 0 27.1z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="dashboard-shape-container-nav-bottom-80_svg__b"
        x1={195}
        x2={195}
        y1={-7.547}
        y2={76.932}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" stopOpacity={0.58} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgDashboardShapeContainerNavBottom80;
