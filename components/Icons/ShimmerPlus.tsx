import * as React from 'react';

type ShimmerPlusProps = {
  kind: 'activity' | 'community' | 'contributor';
};
export const ShimmerPlus = ({ kind }: ShimmerPlusProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    x="0px"
    y="0px"
    viewBox="0 0 3 3"
    style={{
      width: 24,
      height: 24,
    }}
    xmlSpace="preserve"
    shapeRendering="crispEdges">
    <style type="text/css">
      {
        '.activity{fill: #FF5CDB;}.contributor{fill: #ffcf53;}.community{fill: #5653ff;}.starshine{opacity: 0; fill: white;}'
      }
    </style>
    <g className={kind} width={3} height={3}>
      <rect x={1} y={0} width={1} height={1} />
      <rect x={0} y={1} width={1} height={1} />
      <rect x={1} y={1} width={1} height={1} />
      <rect x={2} y={1} width={1} height={1} />
      <rect x={1} y={2} width={1} height={1} />
    </g>
    <g>
      <rect className="starshine" x={0} y={1} width={1} height={1}>
        <animate
          attributeName="opacity"
          values="0;.8;0"
          dur="5s"
          begin="0s"
          repeatCount="indefinite"
        />
      </rect>
      <rect className="starshine" x={1} y={2} width={1} height={1}>
        <animate
          attributeName="opacity"
          values="0;.8;0"
          dur="5s"
          begin="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect className="starshine" x={1} y={1} width={1} height={1}>
        <animate
          attributeName="opacity"
          values="0;.5;0"
          dur="5s"
          begin="1200ms"
          repeatCount="indefinite"
        />
      </rect>
      <rect className="starshine" x={2} y={1} width={1} height={1}>
        <animate
          attributeName="opacity"
          values="0;.4;0"
          dur="5s"
          begin="3s"
          repeatCount="indefinite"
        />
      </rect>
    </g>
  </svg>
);
