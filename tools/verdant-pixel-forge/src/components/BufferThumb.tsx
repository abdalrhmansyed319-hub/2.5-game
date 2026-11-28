import React, { useEffect, useRef } from 'react';

interface BufferThumbProps {
  buffer: Uint8ClampedArray;
  width: number;
  height: number;
  className?: string;
  size?: number;
}

export const BufferThumb: React.FC<BufferThumbProps> = ({
  buffer,
  width,
  height,
  className,
  size = 56,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width <= 0 || height <= 0) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, width, height);
    if (buffer.length === width * height * 4) {
      ctx.putImageData(new ImageData(new Uint8ClampedArray(buffer), width, height), 0, 0);
    }
  }, [buffer, width, height]);

  return (
    <canvas
      ref={ref}
      className={`pixel-canvas ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
      }}
    />
  );
};
