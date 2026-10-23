import * as React from "react";
import Svg, { Mask, Path, G } from "react-native-svg";
const SvgSaveExpenseButtonPlusCenter = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 78 78"
    {...props}
  >
    <Mask
      id="save-expense-button-plus-center_svg__a"
      width={78}
      height={78}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h77.987v78H0z" />
    </Mask>
    <G mask="url(#save-expense-button-plus-center_svg__a)">
      <Path
        fill="#099"
        fillOpacity={0.56}
        d="M38.995 0C17.523 0 0 17.526 0 38.999 0 60.474 17.523 78 38.995 78c21.47 0 38.992-17.525 38.992-39.001C77.987 17.526 60.464 0 38.995 0m19.37 43.937H43.93v14.439a4.95 4.95 0 0 1-4.935 4.936c-2.715 0-4.938-2.221-4.938-4.936V43.937H19.621c-2.715 0-4.935-2.223-4.935-4.938a4.95 4.95 0 0 1 4.935-4.936h14.436V19.624c0-2.715 2.223-4.938 4.938-4.938s4.935 2.223 4.935 4.938v14.439h14.436c2.715 0 4.938 2.22 4.938 4.936s-2.224 4.938-4.938 4.938"
      />
    </G>
  </Svg>
);
export default SvgSaveExpenseButtonPlusCenter;
