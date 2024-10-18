import { FaSpinner } from 'react-icons/fa';
import React from 'react';
import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  cancelText?: string;
  icon?: React.ReactNode;
  stopIcon?: React.ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  text,
  cancelText,
  icon,
  stopIcon,
  className,
  loading,
  disabled,
  onClick,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      className={clsx(className, 'flex items-center')}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <>
            {stopIcon ? stopIcon : <FaSpinner className="animate-spin" />}
            <span className={clsx({ 'hidden md:block': !!stopIcon })}>
              {cancelText}
            </span>
          </>
        ) : (
          <>
            {icon}
            <span className={clsx({ 'hidden md:block': !!icon })}>
              {text}
            </span>
          </>
        )}
      </div>
    </button>
  );
};

export default Button;
