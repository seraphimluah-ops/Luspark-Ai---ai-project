import React from 'react';
import { MBLogo } from './MBLogo';

interface LogoProps {
  className?: string;
  size?: number;
}

export const LuraSparkLogo: React.FC<LogoProps> = (props) => {
  return <MBLogo {...props} />;
};
