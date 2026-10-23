import * as React from "react";
import Svg, {
  ForeignObject,
  G,
  Rect,
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: div */
const SvgCalculatorButton4Row3 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 60"
    {...props}
  >
    <ForeignObject width={86} height={84} x={-12} y={-12}></ForeignObject>
    <G data-figma-bg-blur-radius={12}>
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        fill="url(#calculator-button-4-row3_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-4-row3_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M21.62 36.136v-3.072l11.232-14.848h3.904v14.72h3.168v3.2h-3.168V41h-3.68v-4.864zm11.712-13.568-7.936 10.368h7.936z"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-4-row3_svg__b"
        x1={-11}
        x2={70}
        y1={0}
        y2={69.5}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.6} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-4-row3_svg__c"
        x1={-5}
        x2={31}
        y1={-5.5}
        y2={60}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
      <ClipPath
        id="calculator-button-4-row3_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton4Row3;
