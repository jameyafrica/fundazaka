import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgCalculatorShapeCardMain = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 361 721"
    {...props}
  >
    <G filter="url(#calculator-shape-card-main_svg__a)">
      <Path
        fill="url(#calculator-shape-card-main_svg__b)"
        fillOpacity={0.8}
        d="M.1 27.1c0-14.912 12.088-27 27-27h306c14.912 0 27 12.088 27 27v666c0 14.912-12.088 27-27 27h-306c-14.912 0-27-12.088-27-27z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-shape-card-main_svg__b"
        x1={334.1}
        x2={18.55}
        y1={-16.219}
        y2={725.598}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorShapeCardMain;
