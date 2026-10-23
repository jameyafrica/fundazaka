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
const SvgCalculatorButton6Row3 = (props) => (
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
        fill="url(#calculator-button-6-row3_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-6-row3_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M35.048 24.488q-.576-3.776-3.936-3.776-2.431 0-3.648 1.952-1.215 1.92-1.216 6.048l.032 1.088q.48-1.729 2.08-2.752 1.6-1.024 3.776-1.024 3.328 0 5.216 1.984 1.888 1.985 1.888 5.6 0 2.176-.864 3.904-.864 1.695-2.592 2.72-1.727.992-4.256.992-4.896 0-6.72-3.04t-1.824-8.352q0-6.08 1.952-9.088t6.4-3.008q3.328 0 5.088 1.888 1.792 1.888 2.08 4.864zM26.6 33.192q0 2.08 1.216 3.488 1.215 1.376 3.584 1.376 2.016 0 3.2-1.184 1.216-1.184 1.216-3.296 0-2.272-1.216-3.488-1.216-1.215-3.296-1.216-1.888 0-3.296 1.12t-1.408 3.2"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-6-row3_svg__b"
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
        id="calculator-button-6-row3_svg__c"
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
        id="calculator-button-6-row3_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton6Row3;
