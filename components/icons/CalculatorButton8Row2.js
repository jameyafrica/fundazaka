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
const SvgCalculatorButton8Row2 = (props) => (
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
        fill="url(#calculator-button-8-row2_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={59}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-8-row2_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#fff"
        d="M22.74 23.656q0-1.665.896-3.04t2.656-2.208q1.792-.832 4.288-.832t4.256.832q1.792.832 2.688 2.208a5.3 5.3 0 0 1 .928 3.04q0 1.856-.992 3.2-.96 1.344-2.88 1.952 2.144.672 3.296 2.176 1.152 1.472 1.152 3.616 0 3.296-2.336 5.152-2.336 1.824-6.112 1.824t-6.112-1.824q-2.304-1.856-2.304-5.152 0-2.145 1.152-3.616 1.152-1.504 3.296-2.176-1.92-.608-2.912-1.952-.96-1.344-.96-3.2m3.616.576q0 1.728 1.12 2.688 1.152.928 3.104.928t3.104-.928q1.152-.96 1.152-2.688t-1.184-2.688q-1.152-.96-3.072-.96t-3.072.96-1.152 2.688m-.64 10.176q0 1.952 1.312 3.072 1.313 1.088 3.552 1.088 2.24 0 3.552-1.088 1.312-1.12 1.312-3.072 0-1.984-1.376-2.976-1.344-1.024-3.488-1.024-2.111 0-3.488 1.024t-1.376 2.976"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-8-row2_svg__b"
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
        id="calculator-button-8-row2_svg__c"
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
        id="calculator-button-8-row2_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={59} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButton8Row2;
