import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgBreakdownIncomeIconGift = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 94 28"
    {...props}
  >
    <G filter="url(#breakdown-income-icon-gift_svg__a)">
      <Path
        fill="url(#breakdown-income-icon-gift_svg__b)"
        fillOpacity={0.8}
        d="M.1 13.6C.1 6.144 6.144.1 13.6.1h66c7.456 0 13.5 6.044 13.5 13.5s-6.044 13.5-13.5 13.5h-66C6.144 27.1.1 21.056.1 13.6"
      />
    </G>
    <Defs>
      <LinearGradient
        id="breakdown-income-icon-gift_svg__b"
        x1={81.44}
        x2={16.601}
        y1={4.927}
        y2={65.516}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgBreakdownIncomeIconGift;
