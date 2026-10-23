import * as React from "react";
import Svg, { Mask, Path, G } from "react-native-svg";
const SvgBreakdownIncomeIconOther = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 25 25"
    {...props}
  >
    <Mask
      id="breakdown-income-icon-other_svg__a"
      width={25}
      height={25}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h24.677v24.677H0z" />
    </Mask>
    <G mask="url(#breakdown-income-icon-other_svg__a)">
      <Path
        fill="#fff"
        fillOpacity={0.7}
        d="M24.673 12.336c0 6.813-5.523 12.337-12.337 12.337-6.813 0-12.338-5.524-12.338-12.337 0-6.814 5.525-12.338 12.338-12.338s12.337 5.524 12.337 12.338m-12.337-1.851a1.85 1.85 0 1 0 0 3.701 1.85 1.85 0 0 0 0-3.701m-6.17 0a1.85 1.85 0 1 0 0 3.701 1.85 1.85 0 0 0 0-3.701m12.339 0a1.85 1.85 0 1 0 0 3.701 1.85 1.85 0 0 0 0-3.701"
      />
    </G>
  </Svg>
);
export default SvgBreakdownIncomeIconOther;
