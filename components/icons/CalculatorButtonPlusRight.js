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
const SvgCalculatorButtonPlusRight = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 96"
    {...props}
  >
    <G filter="url(#calculator-button-plus-right_svg__a)">
      <Rect
        width={62}
        height={96}
        fill="url(#calculator-button-plus-right_svg__b)"
        rx={12}
      />
      <Rect
        width={61}
        height={95}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-plus-right_svg__c)"
        rx={11.5}
      />
      <Path
        fill="#000"
        fillOpacity={0.7}
        d="M38.812 49.144h-6.4v6.464H28.86v-6.464h-6.368v-3.36h6.368v-6.496h3.552v6.496h6.4z"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-plus-right_svg__b"
        x1={68.5}
        x2={-8.5}
        y1={-8}
        y2={106}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#ADD8FF" />
        <Stop offset={1} stopColor="#ADD8FF" stopOpacity={0.28} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-plus-right_svg__c"
        x1={0}
        x2={75.5}
        y1={102.5}
        y2={-6}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.39} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0} />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonPlusRight;
