import * as React from "react";
import Svg, { G, Rect, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgAddExpenseIncomeShapeInputField = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 320 45"
    {...props}
  >
    <G filter="url(#add-expense-income-shape-input-field_svg__a)">
      <Rect
        width={319}
        height={44}
        x={0.1}
        y={0.1}
        fill="#099"
        fillOpacity={0.56}
        rx={22}
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default SvgAddExpenseIncomeShapeInputField;
