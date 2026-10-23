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
const SvgCalculatorButton0BottomLeft = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 144 60"
    {...props}
  >
    <ForeignObject width={168} height={84} x={-12} y={-12}></ForeignObject>
    <G data-figma-bg-blur-radius={12}>
      <Rect
        width={143}
        height={59}
        x={0.5}
        y={0.5}
        fill="url(#calculator-button-0-bottom-left_svg__b)"
        rx={15.5}
      />
      <Rect
        width={143}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-0-bottom-left_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M63.664 29.544q0 5.408 1.92 8.48 1.92 3.04 6.4 3.04t6.4-3.072 1.92-8.448q0-5.344-1.92-8.384-1.92-3.072-6.4-3.072t-6.4 3.04-1.92 8.416m12.992 0q0 3.904-.96 5.984t-3.712 2.08q-2.784 0-3.744-2.08t-.96-5.984q0-3.872.96-5.92t3.744-2.048q2.752 0 3.712 2.08.96 2.048.96 5.888"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-0-bottom-left_svg__b"
        x1={-25.548}
        x2={40.154}
        y1={0}
        y2={130.934}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.6} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-0-bottom-left_svg__c"
        x1={-11.613}
        x2={7.499}
        y1={-5.5}
        y2={75.264}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
      <ClipPath
        id="calculator-button-0-bottom-left_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={143} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton0BottomLeft;
