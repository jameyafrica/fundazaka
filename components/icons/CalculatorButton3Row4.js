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
const SvgCalculatorButton3Row4 = (props) => (
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
        fill="url(#calculator-button-3-row4_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-3-row4_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M31.1 17.704q2.24 0 3.84.8 1.6.768 2.4 2.144.832 1.376.832 3.072 0 2.144-1.216 3.584-1.185 1.408-3.36 1.696v.16q2.336.672 3.648 2.016 1.344 1.312 1.344 3.648 0 2.848-1.888 4.64-1.888 1.76-5.408 1.76-3.616 0-5.824-1.824-2.208-1.855-2.528-5.472h3.616q.192 1.92 1.376 3.072 1.185 1.12 3.2 1.12 1.888 0 2.88-.992 1.024-.992 1.024-2.56 0-1.889-1.472-2.88-1.44-.992-4.192-.992h-.864v-3.008h.864q5.216.064 5.216-3.552 0-1.568-.96-2.464t-2.624-.896T28.22 21.8q-1.12.992-1.344 2.912h-3.584q.224-3.328 2.24-5.152 2.016-1.856 5.568-1.856"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-3-row4_svg__b"
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
        id="calculator-button-3-row4_svg__c"
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
        id="calculator-button-3-row4_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton3Row4;
