import React from 'react';

export const CoinbaseWallet = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 383 383">
    <g clipPath="url(#a)" filter="url(#b)">
      <path fill="url(#c)" d="M.998.572H382.78v381.782H.998V.572Z" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M59.107 191.572c0 73.394 59.498 132.891 132.891 132.891 73.394 0 132.891-59.497 132.891-132.891 0-73.393-59.497-132.89-132.891-132.89-73.393 0-132.89 59.497-132.89 132.89Zm98.93-42.82a8.859 8.859 0 0 0-8.859 8.859v67.922a8.86 8.86 0 0 0 8.859 8.86h67.922a8.86 8.86 0 0 0 8.859-8.86v-67.922a8.859 8.859 0 0 0-8.859-8.859h-67.922Z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <linearGradient
        id="c"
        x1={191.889}
        x2={191.889}
        y1={0.572}
        y2={382.354}
        gradientUnits="userSpaceOnUse">
        <stop stopColor="#2E66F8" />
        <stop offset={1} stopColor="#124ADB" />
      </linearGradient>
      <clipPath id="a">
        <path
          fill="#fff"
          d="M0 0h381.782v381.782H0z"
          transform="translate(.998 .572)"
        />
      </clipPath>
      <filter
        id="b"
        width={429.782}
        height={429.782}
        x={-23.002}
        y={-7.428}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={16} />
        <feGaussianBlur stdDeviation={12} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow" />
        <feColorMatrix
          in="SourceAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={4} />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0" />
        <feBlend in2="effect1_dropShadow" result="effect2_dropShadow" />
        <feBlend in="SourceGraphic" in2="effect2_dropShadow" result="shape" />
      </filter>
    </defs>
  </svg>
);
