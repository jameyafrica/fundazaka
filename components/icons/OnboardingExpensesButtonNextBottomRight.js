import * as React from "react";
import Svg, {
  Mask,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
const SvgOnboardingExpensesButtonNextBottomRight = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 45 45"
    {...props}
  >
    <Mask
      id="onboarding-expenses-button-next-bottom-right_svg__a"
      width={45}
      height={45}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h44.036v44.105H0z" />
    </Mask>
    <G mask="url(#onboarding-expenses-button-next-bottom-right_svg__a)">
      <Path
        fill="url(#onboarding-expenses-button-next-bottom-right_svg__b)"
        fillOpacity={0.56}
        d="M22.013-.003C9.873-.003-.003 9.889-.003 22.047c0 12.16 9.876 22.051 22.016 22.051s22.016-9.892 22.016-22.05c0-12.16-9.876-22.051-22.016-22.051m8 24-8.256 8.269a2.74 2.74 0 0 1-1.946.807c-.704 0-1.409-.27-1.946-.807a2.76 2.76 0 0 1 0-3.899l6.31-6.32-6.31-6.32a2.76 2.76 0 0 1 0-3.898 2.75 2.75 0 0 1 3.892 0l8.257 8.27a2.76 2.76 0 0 1 0 3.898"
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-expenses-button-next-bottom-right_svg__b"
        x1={118}
        x2={3.5}
        y1={-37.5}
        y2={36}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.396} stopColor="#099" />
        <Stop offset={0.558} stopColor="#033" />
        <Stop offset={0.676} stopColor="#005252" />
        <Stop offset={0.853} stopColor="#3EB9B9" stopOpacity={0.87} />
        <Stop offset={0.981} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingExpensesButtonNextBottomRight;
