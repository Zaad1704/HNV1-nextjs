import React from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = ''
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  const getResponsiveClass = () => {
    if (isMobile && mobileClassName) return mobileClassName;
    if (isTablet && tabletClassName) return tabletClassName;
    if (isDesktop && desktopClassName) return desktopClassName;
    return className;
  };

  return (
    <div className={`${className} ${getResponsiveClass()}`}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;