import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgCalculatorButtonMultiplyTopRow1 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 62"
    {...props}
  >
    <G filter="url(#calculator-button-multiply-top-row1_svg__a)">
      <Path
        fill="url(#calculator-button-multiply-top-row1_svg__b)"
        d="M0 12C0 5.373 5.373 0 12 0h38c6.627 0 12 5.373 12 12v38c0 6.627-5.373 12-12 12H12C5.373 62 0 56.627 0 50z"
      />
      <Path
        stroke="url(#calculator-button-multiply-top-row1_svg__c)"
        d="M12 .5h38C56.351.5 61.5 5.649 61.5 12v38c0 6.351-5.149 11.5-11.5 11.5H12C5.649 61.5.5 56.351.5 50V12C.5 5.649 5.649.5 12 .5Z"
      />
      <Path
        fill="#000"
        fillOpacity={0.7}
        d="M34.4 27.71a1.265 1.265 0 0 1 1.871.374l.035.06a1.203 1.203 0 0 1-.631 1.719c-1.047.388-1.047 1.872.002 2.252.694.252.997 1.066.638 1.71l-.071.128a1.255 1.255 0 0 1-1.878.372c-.893-.709-2.188.072-2.017 1.2A1.28 1.28 0 0 1 31.093 37h-.032a1.285 1.285 0 0 1-1.272-1.46c.159-1.15-1.17-1.904-2.074-1.177a1.282 1.282 0 0 1-1.92-.366l-.098-.173a1.21 1.21 0 0 1 .633-1.724c1.038-.387 1.052-1.862.013-2.245a1.194 1.194 0 0 1-.63-1.702l.046-.081a1.273 1.273 0 0 1 1.885-.39l.044.032c.928.711 2.25-.068 2.083-1.225A1.306 1.306 0 0 1 31.065 25c.79 0 1.4.712 1.28 1.494-.172 1.14 1.141 1.919 2.055 1.215"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-multiply-top-row1_svg__b"
        x1={68.5}
        x2={29.208}
        y1={-5.167}
        y2={84.907}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#ADD8FF" />
        <Stop offset={1} stopColor="#ADD8FF" stopOpacity={0.28} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-multiply-top-row1_svg__c"
        x1={0}
        x2={38.886}
        y1={66.198}
        y2={-20.33}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.39} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonMultiplyTopRow1;
