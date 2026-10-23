import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgLearningPathwaysShapeCardStreaksBadgesContainerMiddle = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 320 48"
    {...props}
  >
    <G filter="url(#learning-pathways-shape-card-streaks-badges-container-middle_svg__a)">
      <Path
        fill="url(#learning-pathways-shape-card-streaks-badges-container-middle_svg__b)"
        fillOpacity={0.8}
        d="M.1 23.6C.1 10.621 10.621.1 23.6.1h272c12.979 0 23.5 10.521 23.5 23.5s-10.521 23.5-23.5 23.5h-272C10.621 47.1.1 36.579.1 23.6"
      />
    </G>
    <Defs>
      <LinearGradient
        id="learning-pathways-shape-card-streaks-badges-container-middle_svg__b"
        x1={279.105}
        x2={184.216}
        y1={8.503}
        y2={183.224}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgLearningPathwaysShapeCardStreaksBadgesContainerMiddle;
