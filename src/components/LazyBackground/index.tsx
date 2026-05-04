import React, { useEffect, useState, CSSProperties } from 'react';

type LazyBackgroundProps = {
  src: string; // URL of the high-res background image
  placeholder?: string; // Optional URL of a low-res placeholder image
  style?: CSSProperties; // Additional styles for the container div
  className?: string; // Optional CSS class name
  children?: React.ReactNode; // Optional children inside the div
};

export const LazyBackground: React.FC<LazyBackgroundProps> = ({
  src,
  placeholder,
  style,
  className,
  children
}) => {
  const [background, setBackground] = useState<string>(placeholder ?? '');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setBackground(`url(${src})`);
    img.onerror = () => setBackground(placeholder ?? '');
  }, [src]);

  return (
    <div
      className={className}
      style={{
        backgroundImage: background,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        position: 'relative',
        ...style
      }}
    >
      {children}
    </div>
  );
};
