import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgCalculatorButtonDivideTopRow1 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 62"
    {...props}
  >
    <G filter="url(#calculator-button-divide-top-row1_svg__a)">
      <Path
        fill="url(#calculator-button-divide-top-row1_svg__b)"
        d="M0 12C0 5.373 5.373 0 12 0h38c6.627 0 12 5.373 12 12v38c0 6.627-5.373 12-12 12H12C5.373 62 0 56.627 0 50z"
      />
      <Path
        stroke="url(#calculator-button-divide-top-row1_svg__c)"
        d="M12 .5h38C56.351.5 61.5 5.649 61.5 12v38c0 6.351-5.149 11.5-11.5 11.5H12C5.649 61.5.5 56.351.5 50V12C.5 5.649 5.649.5 12 .5Z"
      />
      <Path
        fill="#000"
        fillOpacity={0.7}
        d="M33.738 18a1.658 1.658 0 0 1 1.581 2.157l-7.475 23.684a1.658 1.658 0 0 1-3.163-.998l7.475-23.684c.218-.69.858-1.159 1.582-1.159"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-divide-top-row1_svg__b"
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
        id="calculator-button-divide-top-row1_svg__c"
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
export default SvgCalculatorButtonDivideTopRow1;
