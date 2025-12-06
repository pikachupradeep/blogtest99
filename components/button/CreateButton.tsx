'use client'

import Link from 'next/link';
import { ReactNode } from 'react';
import { FaPlus } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CreateButton = ({ 
  href, 
  children, 
  variant = 'primary', 
  size = 'sm', 
  className = '' 
}: ButtonProps) => {
  const pathname = usePathname();
  
  // Hide the button if we're already on the target page
  if (pathname === href) {
    return null;
  }

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm',
    outline: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm'
  };

  const classes = `${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`;

  return (
    <Link href={href} className={classes}>
      <span className="flex items-center gap-2">
        <FaPlus className="w-3 h-3" />
        {children}
      </span>
    </Link>
  );
};

export default CreateButton;