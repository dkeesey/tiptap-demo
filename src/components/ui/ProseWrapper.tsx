import React from 'react'
import { cn } from '../../utils/classnames'

interface ProseWrapperProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'sm' | 'lg';
  editable?: boolean;
}

const ProseWrapper: React.FC<ProseWrapperProps> = ({
  children, 
  className = '', 
  variant = 'default',
  editable = true
}) => {
  return (
    <div 
      className={cn(
        'prose', 
        `prose-${variant}`,
        'prose-headings:font-semibold',
        'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
        'prose-code:bg-gray-100 prose-code:rounded prose-code:px-1 prose-code:py-0.5',
        'prose-pre:bg-gray-50 prose-pre:rounded-lg prose-pre:p-4',
        'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:italic',
        'prose-li:my-0',
        editable 
          ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50' 
          : 'select-none cursor-default',
        className
      )}
    >
      {children}
    </div>
  )
}

export default ProseWrapper