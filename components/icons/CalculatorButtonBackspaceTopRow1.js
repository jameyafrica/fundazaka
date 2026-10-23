import * as React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
const SvgCalculatorButtonBackspaceTopRow1 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 62"
    {...props}
  >
    <Path
      fill="url(#calculator-button-backspace-top-row1_svg__a)"
      d="M0 16C0 7.163 7.163 0 16 0h30c8.837 0 16 7.163 16 16v30c0 8.837-7.163 16-16 16H16C7.163 62 0 54.837 0 46z"
    />
    <Path
      stroke="url(#calculator-button-backspace-top-row1_svg__b)"
      d="M16 .5h30C54.56.5 61.5 7.44 61.5 16v30c0 8.56-6.94 15.5-15.5 15.5H16C7.44 61.5.5 54.56.5 46V16C.5 7.44 7.44.5 16 .5Z"
    />
    <Path
      fill="#000"
      d="M23.535 22H38a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H23.535a1 1 0 0 1-.832-.445l-5.333-8a1 1 0 0 1 0-1.11l5.333-8a1 1 0 0 1 .832-.445m.535 2-4.666 7 4.666 7H37V24zM30 29.586l2.828-2.829 1.415 1.415L31.414 31l2.83 2.828-1.416 1.415L30 32.414l-2.828 2.829-1.415-1.415L28.587 31l-2.83-2.828 1.415-1.415z"
      style={{
        mixBlendMode: "overlay",
      }}
    />
    <Defs>
      <LinearGradient
        id="calculator-button-backspace-top-row1_svg__a"
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
        id="calculator-button-backspace-top-row1_svg__b"
        x1={-5}
        x2={32.845}
        y1={-5.683}
        y2={60.952}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonBackspaceTopRow1;
