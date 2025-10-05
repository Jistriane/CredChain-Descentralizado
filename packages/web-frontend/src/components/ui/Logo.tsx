import React from 'react';
import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'compact' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({
  width = 200,
  height = 100,
  className = '',
  showText = true,
  variant = 'default'
}) => {
  const getLogoSize = () => {
    switch (variant) {
      case 'compact':
        return { width: 120, height: 60 };
      case 'icon':
        return { width: 40, height: 40 };
      default:
        return { width, height };
    }
  };

  const logoSize = getLogoSize();

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="Logo"
        width={logoSize.width}
        height={logoSize.height}
        className="object-contain"
        priority
      />
      {showText && variant !== 'icon' && (
        <div className="ml-3">
          <h1 className="text-2xl font-bold text-blue-900">
            Cred<span className="text-yellow-600">Chain</span>
          </h1>
        </div>
      )}
    </div>
  );
};

export default Logo;
