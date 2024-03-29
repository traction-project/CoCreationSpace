import * as React from "react";

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
  total: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, total }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percentage = `${((progress / total) * 100).toFixed(2)}%`;

  const isComplete = total == progress;
  const strokeDashoffset = (isComplete) ? (
    circumference / 2
  ) : (
    circumference - progress / total * circumference
  );

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#F8F1F1"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#5DD2F6"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + " " + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      >
        {(isComplete) && (
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from={`0 ${radius} ${radius}`}
            to={`360 ${radius} ${radius}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {(!isComplete) && (
        <text x="50%" y="50%" textAnchor="middle" stroke="#5DD2F6" dy=".3em">
          {percentage}
        </text>
      )}
    </svg>
  );
};

export default ProgressRing;
