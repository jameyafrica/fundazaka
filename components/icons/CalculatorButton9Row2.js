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
const SvgCalculatorButton9Row2 = (props) => (
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
        fill="url(#calculator-button-9-row2_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-9-row2_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M26.664 34.472q.256 1.824 1.248 2.816 1.024.992 2.752.992 2.432 0 3.616-1.92 1.215-1.952 1.216-6.112l-.032-1.088q-.512 1.728-2.144 2.784-1.6 1.024-3.744 1.024-3.328 0-5.216-1.984-1.888-2.016-1.888-5.6 0-2.175.864-3.904.864-1.728 2.592-2.72 1.728-1.024 4.256-1.024 4.896 0 6.72 3.008Q38.76 23.72 38.76 29q0 5.985-1.888 9.12-1.856 3.136-6.208 3.136-3.36 0-5.28-1.888-1.888-1.92-2.176-4.896zm8.448-8.704q0-2.08-1.216-3.456-1.184-1.408-3.584-1.408-1.985 0-3.2 1.184-1.184 1.185-1.184 3.328 0 2.272 1.184 3.488 1.216 1.215 3.296 1.216 1.215 0 2.272-.48a4.4 4.4 0 0 0 1.76-1.472q.672-.992.672-2.4"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-9-row2_svg__b"
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
        id="calculator-button-9-row2_svg__c"
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
        id="calculator-button-9-row2_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton9Row2;
