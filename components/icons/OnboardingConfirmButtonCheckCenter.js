import * as React from "react";
import Svg, {
  Mask,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
const SvgOnboardingConfirmButtonCheckCenter = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 60 61"
    {...props}
  >
    <Mask
      id="onboarding-confirm-button-check-center_svg__a"
      width={60}
      height={61}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h60v60.094H0z" />
    </Mask>
    <G mask="url(#onboarding-confirm-button-check-center_svg__a)">
      <Path
        fill="url(#onboarding-confirm-button-check-center_svg__b)"
        fillOpacity={0.47}
        d="M29.993-.005C13.453-.005-.006 13.473-.006 30.04c0 16.566 13.457 30.044 29.998 30.044 16.54 0 29.997-13.478 29.997-30.045 0-16.566-13.457-30.044-29.998-30.044m14.12 26.16-15 15.022a3 3 0 0 1-2.12.88 3 3 0 0 1-2.12-.88l-6-6.009a3.005 3.005 0 0 1 0-4.248 2.994 2.994 0 0 1 4.242 0l3.878 3.885 12.878-12.898a2.993 2.993 0 0 1 4.241 0 3.005 3.005 0 0 1 0 4.248"
      />
    </G>
    <Defs>
      <LinearGradient
        id="onboarding-confirm-button-check-center_svg__b"
        x1={-10.728}
        x2={49.215}
        y1={-7.905}
        y2={56.392}
        gradientUnits="userSpaceOnUse"
      >
        <Stop offset={0.08} stopColor="#099" />
        <Stop offset={0.452} stopColor="#08A5A5" />
        <Stop offset={0.571} stopColor="#09B5B5" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgOnboardingConfirmButtonCheckCenter;
