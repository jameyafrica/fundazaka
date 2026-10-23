import * as React from "react";
import Svg, {
  G,
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgCalculatorButtonMinusRow2 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 60"
    {...props}
  >
    <G filter="url(#calculator-button-minus-row2_svg__a)">
      <Rect
        width={62}
        height={60}
        fill="url(#calculator-button-minus-row2_svg__b)"
        rx={12}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-minus-row2_svg__c)"
        rx={11.5}
      />
      <Path
        fill="#000"
        fillOpacity={0.7}
        d="M35.396 27.88v3.072H22.212V27.88z"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-minus-row2_svg__b"
        x1={68.5}
        x2={31.325}
        y1={-5}
        y2={83.062}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#ADD8FF" />
        <Stop offset={1} stopColor="#ADD8FF" stopOpacity={0.28} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-minus-row2_svg__c"
        x1={0}
        x2={36.81}
        y1={64.063}
        y2={-20.576}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.39} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonMinusRow2;
