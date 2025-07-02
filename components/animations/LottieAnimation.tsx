import React from 'react';
import Lottie from 'lottie-react';

interface LottieAnimationProps {
  src: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  src,
  className = "",
  loop = true,
  autoplay = true,
  style = {}
}) => {
  return (
    <div className={className} style={style}>
      <iframe
        src={src}
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          ...style
        }}
        title="Lottie Animation"
      />
    </div>
  );
};

export default LottieAnimation;
