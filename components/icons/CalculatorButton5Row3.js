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
const SvgCalculatorButton5Row3 = (props) => (
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
        fill="url(#calculator-button-5-row3_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-5-row3_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M38.312 21.288H27.144v6.72q.768-.992 2.176-1.568 1.408-.608 3.104-.608 2.368 0 3.936 1.024a5.9 5.9 0 0 1 2.304 2.656q.768 1.664.768 3.68 0 3.552-1.984 5.76-1.985 2.175-5.76 2.176-3.552 0-5.728-1.888t-2.368-5.024h3.584q.288 1.728 1.408 2.72 1.152.992 2.912.992 2.176 0 3.264-1.312t1.088-3.488q0-2.048-1.12-3.2-1.12-1.184-3.2-1.184-1.471 0-2.592.64-1.088.64-1.6 1.696h-3.552V18.056h14.528z"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-5-row3_svg__b"
        x1={0}
        x2={81.5}
        y1={-13.5}
        y2={47}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.6} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.4} />
      </LinearGradient>
      <LinearGradient
        id="calculator-button-5-row3_svg__c"
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
        id="calculator-button-5-row3_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton5Row3;
