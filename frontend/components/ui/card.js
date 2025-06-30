import React from 'react';

export const Card = ({ className, children, ...props }) => {
  return (
    <div
      className={`card card-hover backdrop-blur-sm border border-gray-100/60 rounded-xl shadow-md transition-all ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }) => {
  return (
    <div 
      className={`px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-primary-50/20 rounded-t-xl ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ className, children, ...props }) => {
  return (
    <h3 
      className={`text-lg font-semibold text-primary-700 tracking-tight ${className || ''}`} 
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription = ({ className, children, ...props }) => {
  return (
    <p 
      className={`mt-1 text-sm text-gray-500 max-w-2xl ${className || ''}`} 
      {...props}
    >
      {children}
    </p>
  );
};

export const CardContent = ({ className, children, ...props }) => {
  return (
    <div 
      className={`px-6 py-5 ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={`px-6 py-4 bg-gradient-to-r from-gray-50 to-primary-50/30 border-t border-gray-100 rounded-b-xl flex justify-end ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};