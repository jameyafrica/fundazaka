import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgLearningPathwaysShapeCardHeroTop = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 320 97"
    {...props}
  >
    <G filter="url(#learning-pathways-shape-card-hero-top_svg__a)">
      <Path
        fill="url(#learning-pathways-shape-card-hero-top_svg__b)"
        fillOpacity={0.8}
        d="M.1 27.1c0-14.912 12.088-27 27-27h265c14.912 0 27 12.088 27 27v42c0 14.912-12.088 27-27 27h-265c-14.912 0-27-12.088-27-27z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="learning-pathways-shape-card-hero-top_svg__b"
        x1={279.105}
        x2={49.274}
        y1={17.264}
        y2={224.451}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgLearningPathwaysShapeCardHeroTop;
