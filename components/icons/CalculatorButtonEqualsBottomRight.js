import * as React from "react";
import Svg, { G, Rect, Path, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgCalculatorButtonEqualsBottomRight = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 108 142"
    {...props}
  >
    <G filter="url(#calculator-button-equals-bottom-right_svg__a)">
      <Rect width={62} height={96} x={32} y={10} fill="#19ACFF" rx={12} />
      <Path
        fill="#B2DAFF"
        d="M71.516 52.168v3.328H54.492v-3.328zm0 7.2v3.328H54.492v-3.328z"
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default SvgCalculatorButtonEqualsBottomRight;
