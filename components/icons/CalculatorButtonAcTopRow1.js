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
const SvgCalculatorButtonAcTopRow1 = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 62 62"
    {...props}
  >
    <ForeignObject width={86} height={86} x={-12} y={-12}></ForeignObject>
    <G data-figma-bg-blur-radius={12}>
      <Rect
        width={61}
        height={61}
        x={0.5}
        y={0.5}
        fill="url(#calculator-button-ac-top-row1_svg__b)"
        rx={15.5}
      />
      <Rect
        width={61}
        height={61}
        x={0.5}
        y={0.5}
        stroke="url(#calculator-button-ac-top-row1_svg__c)"
        rx={15.5}
      />
      <Path
        fill="#000"
        d="M25.68 37.104h-9.536L14.416 42h-3.904l8.32-22.24h4.192L31.312 42h-3.904zm-1.024-2.816-3.744-10.56-3.744 10.56zm17.205-10.144q3.423 0 5.664 1.824 2.239 1.793 2.784 4.896h-3.872q-.32-1.664-1.569-2.592-1.215-.96-3.072-.96-2.11 0-3.52 1.504-1.407 1.472-1.408 4.352t1.408 4.384 3.52 1.504q1.857 0 3.072-.96 1.248-.96 1.569-2.624h3.872q-.545 3.105-2.784 4.928-2.241 1.824-5.664 1.824-2.56 0-4.544-1.088-1.953-1.087-3.072-3.136-1.12-2.048-1.12-4.832 0-2.752 1.12-4.8 1.119-2.047 3.072-3.136 1.983-1.088 4.544-1.088"
        style={{
          mixBlendMode: "overlay",
        }}
      />
    </G>
    <Defs>
      <LinearGradient
        id="calculator-button-ac-top-row1_svg__b"
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
        id="calculator-button-ac-top-row1_svg__c"
        x1={-5}
        x2={32.845}
        y1={-5.683}
        y2={60.952}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#fff" stopOpacity={0.85} />
        <Stop offset={1} stopColor="#fff" stopOpacity={0.17} />
      </LinearGradient>
      <ClipPath
        id="calculator-button-ac-top-row1_svg__a"
        transform="translate(12 12)"
      >
        <Rect width={61} height={61} x={0.5} y={0.5} rx={15.5} />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SvgCalculatorButtonAcTopRow1;
