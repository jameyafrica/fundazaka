import * as React from "react";
import Svg, { Path, Mask, G } from "react-native-svg";
const SvgBreakdownIncomeIconWork = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 31 25"
    {...props}
  >
    <Path
      fill="#fff"
      fillOpacity={0.1}
      d="M16 15.37v-.739c0-.9-.448-1.631-1-1.631s-1 .73-1 1.631v.739c0 .9.448 1.63 1 1.63s1-.73 1-1.63"
    />
    <Mask
      id="breakdown-income-icon-work_svg__a"
      width={30}
      height={10}
      x={0}
      y={15}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M.412 15.528h29.51V25H.412z" />
    </Mask>
    <G mask="url(#breakdown-income-icon-work_svg__a)">
      <Path
        fill="#fff"
        fillOpacity={0.7}
        d="M17.757 16.157a2.64 2.64 0 0 1-2.519 1.88 2.64 2.64 0 0 1-2.52-1.88H2.426a4.2 4.2 0 0 1-1.813-.413v6.836a2.433 2.433 0 0 0 2.425 2.428h24.398a2.433 2.433 0 0 0 2.425-2.428v-6.835a4.2 4.2 0 0 1-1.813.412z"
      />
    </G>
    <Mask
      id="breakdown-income-icon-work_svg__b"
      width={31}
      height={15}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h30.474v14.552H0z" />
    </Mask>
    <G mask="url(#breakdown-income-icon-work_svg__b)">
      <Path
        fill="#fff"
        fillOpacity={0.7}
        d="M27.947 3.88h-5.824A4.62 4.62 0 0 0 17.57-.008h-4.666A4.62 4.62 0 0 0 8.35 3.88H2.527C1.137 3.88 0 4.973 0 6.308v5.602a2.427 2.427 0 0 0 2.426 2.428h10.178c.034-.7.333-1.326.808-1.78q.022-.02.046-.039.156-.146.334-.266c.042-.028.09-.048.135-.073.098-.057.195-.115.301-.16.083-.034.174-.054.26-.08.075-.023.147-.053.226-.068a2.6 2.6 0 0 1 1.046 0c.078.015.15.045.225.068.088.026.177.046.26.08.106.045.202.103.3.16.045.026.093.045.136.073q.178.121.334.266.023.02.047.04c.475.454.773 1.081.808 1.78h10.178a2.427 2.427 0 0 0 2.425-2.428V6.31c.001-1.336-1.136-2.429-2.526-2.429m-17.26 0a2.34 2.34 0 0 1 2.217-1.616h4.666c1.037 0 1.908.682 2.218 1.616z"
      />
    </G>
  </Svg>
);
export default SvgBreakdownIncomeIconWork;
