import * as React from "react";
import Svg, { G, Rect, Defs } from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */
const SvgLearningLessonButtonQuiz = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="none"
    viewBox="0 0 170 60"
    {...props}
  >
    <G filter="url(#learning-lesson-button-quiz_svg__a)">
      <Rect
        width={169}
        height={59}
        x={0.1}
        y={0.1}
        fill="#099"
        fillOpacity={0.8}
        rx={27}
      />
    </G>
    <Defs></Defs>
  </Svg>
);
export default SvgLearningLessonButtonQuiz;
