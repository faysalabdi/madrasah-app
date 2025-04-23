import React from "react";

interface BackgroundPatternProps {
  children?: React.ReactNode;
  height?: string;
}

export default function BackgroundPattern({ children, height = "h-8" }: BackgroundPatternProps) {
  return (
    <div className={`islamic-pattern ${height} ${children ? 'relative' : ''}`}>
      {children && (
        <div className="relative z-10">{children}</div>
      )}
    </div>
  );
}
