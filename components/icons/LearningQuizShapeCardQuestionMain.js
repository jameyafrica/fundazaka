import * as React from "react";
import Svg, { G, Path, Defs, LinearGradient, Stop } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgLearningQuizShapeCardQuestionMain = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 320 265"
    {...props}
  >
    <G filter="url(#learning-quiz-shape-card-question-main_svg__a)">
      <Path
        fill="url(#learning-quiz-shape-card-question-main_svg__b)"
        fillOpacity={0.8}
        d="M.1 27.1c0-14.912 12.088-27 27-27h265c14.912 0 27 12.088 27 27v210c0 14.912-12.088 27-27 27h-265c-14.912 0-27-12.088-27-27z"
      />
    </G>
    <Defs>
      <LinearGradient
        id="learning-quiz-shape-card-question-main_svg__b"
        x1={279.105}
        x2={-97.077}
        y1={47.3}
        y2={170.616}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#099" />
        <Stop offset={1} stopColor="#033" />
      </LinearGradient>
    </Defs>
  </Svg>
);
export default SvgLearningQuizShapeCardQuestionMain;
