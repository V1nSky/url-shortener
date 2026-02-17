import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = ({ className = '', ...props }: CardProps) => (
  <div className={`bg-[#111118] border border-[#2a2a3a] rounded-2xl ${className}`} {...props} />
);

export const CardHeader = ({ className = '', ...props }: CardProps) => (
  <div className={`p-6 ${className}`} {...props} />
);

export const CardTitle = ({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-xl font-bold tracking-tight text-[#e8e8f0] ${className}`} {...props} />
);

export const CardDescription = ({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm text-[#666680] mt-1 ${className}`} style={{ fontFamily: "'Space Mono', monospace" }} {...props} />
);

export const CardContent = ({ className = '', ...props }: CardProps) => (
  <div className={`px-6 pb-6 ${className}`} {...props} />
);

export const CardFooter = ({ className = '', ...props }: CardProps) => (
  <div className={`flex items-center px-6 pb-6 ${className}`} {...props} />
);
