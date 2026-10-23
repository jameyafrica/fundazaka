import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const SvgCalculatorButtonDecimalBottomCenter = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 62"
    {...props}
  >
    <Path
      fill="url(#calculator-button-decimal-bottom-center_svg__a)"
      d="M0 16C0 7.163 7.163 0 16 0h30c8.837 0 16 7.163 16 16v30c0 8.837-7.163 16-16 16H16C7.163 62 0 54.837 0 46z"
    />
    <Path
      stroke="url(#calculator-button-decimal-bottom-center_svg__b)"
      d="M16 .5h30C54.56.5 61.5 7.44 61.5 16v30c0 8.56-6.94 15.5-15.5 15.5H16C7.44 61.5.5 54.56.5 46V16C.5 7.44 7.44.5 16 .5Z"
    />
    <Path
      fill="url(#calculator-button-decimal-bottom-center_svg__c)"
      d="M29 31.25a2.25 2.25 0 0 1 4.5 0 2.25 2.25 0 0 1-4.5 0"
    />
    <Path
      stroke="url(#calculator-button-decimal-bottom-center_svg__d)"
      d="M31.25 29.5a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5Z"
    />
    <Defs>
      <LinearGradient
        id="calculator-button-decimal-bottom-center_svg__a"
        x1={-11}
        x2={72.24}
        y1={0}
        y2={69.118}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.6} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-decimal-bottom-center_svg__b"
        x1={-5}
        x2={32.845}
        y1={-5.683}
        y2={60.952}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-decimal-bottom-center_svg__c"
        x1={28.202}
        x2={34.243}
        y1={29}
        y2={34.017}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.6} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-decimal-bottom-center_svg__d"
        x1={28.637}
        x2={31.384}
        y1={28.587}
        y2={33.424}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonDecimalBottomCenter;
