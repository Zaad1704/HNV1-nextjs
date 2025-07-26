import React from 'react';

interface UniversalFilterBarProps {
  children: React.ReactNode;
}

const UniversalFilterBar: React.FC<UniversalFilterBarProps> = ({ children }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 flex flex-wrap gap-4 items-center">
      {children}
    </div>
  );
};

export default UniversalFilterBar;