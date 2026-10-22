import * as React from "react";
import Svg, { Mask, Path, G } from "react-native-svg";
const SvgStreaks = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 20 25"
    {...props}
  >
    <Mask
      id="streaks_svg__a"
      width={12}
      height={12}
      x={4}
      y={13}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M4.898 13.807h10.204v10.297H4.898z" />
    </Mask>
    <G mask="url(#streaks_svg__a)">
      <Path
        fill="#fff"
        fillOpacity={0.8}
        d="M13.547 15.305c-3.182-3.075-8.626-.782-8.602 3.65-.062 2.712 2.352 5.124 5.07 5.063 4.518.022 6.777-5.58 3.532-8.713M9.71 18.533h.608c1.684.036 1.785 2.465.118 2.65v.261a.423.423 0 0 1-.844 0v-.253h-.79c-.555-.008-.557-.833 0-.844h1.516c.637-.011.638-.957 0-.97H9.71c-1.685-.037-1.785-2.465-.118-2.65v-.262a.423.423 0 0 1 .844 0v.253h.79c.555.008.556.833 0 .845H9.71c-.638.01-.639.956 0 .97"
      />
    </G>
    <Mask
      id="streaks_svg__b"
      width={20}
      height={23}
      x={0}
      y={0}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "luminance",
      }}
    >
      <Path fill="#fff" d="M0 0h20v22.807H0z" />
    </Mask>
    <G mask="url(#streaks_svg__b)">
      <Path
        fill="#fff"
        fillOpacity={0.8}
        d="M15.05 5.169c-.666-.313-.756.716-.866 1.114-.401 1.992.304 3.659.917 4.658-1.369-.398-2.376-1.583-2.539-3.075C12.337 5.369 10.948 1.42 8.19.414A5.5 5.5 0 0 0 6.264 0a.43.43 0 0 0-.393.228.43.43 0 0 0 .038.447c.789 1.081.741 2.375-.06 3.498a5.2 5.2 0 0 1-1.242 1.228 9.87 9.87 0 0 0-4.52 8.313c0 3.95 2.324 7.364 5.674 8.959a6 6 0 0 1-.769-.984c-2.462-3.851.45-9.085 5.023-9.03 3.17-.084 5.997 2.758 5.914 5.908a5.9 5.9 0 0 1-1.669 4.11c7.102-3.292 7.672-13.493.79-17.508"
      />
    </G>
  </Svg>
);
export default SvgStreaks;
