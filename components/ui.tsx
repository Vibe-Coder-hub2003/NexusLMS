import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react'; 

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', disabled, type = 'button', ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-primary-500";
  
  const variants = {
    primary: "bg-gray-900 text-gray-50 hover:bg-gray-900/90 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80",
    danger: "bg-red-500 text-white hover:bg-red-500/90 dark:bg-red-900 dark:text-white dark:hover:bg-red-900/90",
    outline: "border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50",
    ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50"
  };

  const sizes = {
    sm: "h-9 rounded-md px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-11 rounded-md px-8 text-base",
  };

  return (
    <button 
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

// --- Input ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', id, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100">{label}</label>}
      <input
        id={id}
        className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-primary-500 ${error ? 'border-red-500 focus-visible:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
};

// --- Select ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', id, ...props }) => {
  return (
    <div className="w-full space-y-2">
      {label && <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-100">{label}</label>}
      <div className="relative">
        <select
          id={id}
          className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-primary-500 appearance-none ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50 ${className}`}>
      {title && (
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-6 pt-2">{children}</div>
    </div>
  );
};

// --- Badge ---
export const Badge: React.FC<{ children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: "border-transparent bg-gray-900 text-gray-50 hover:bg-gray-900/80 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/80",
    success: "border-transparent bg-green-500 text-white hover:bg-green-500/80 dark:bg-green-900 dark:text-green-100",
    warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80 dark:bg-yellow-900 dark:text-yellow-100",
    error: "border-transparent bg-red-500 text-white hover:bg-red-500/80 dark:bg-red-900 dark:text-red-100",
    info: "border-transparent bg-blue-500 text-white hover:bg-blue-500/80 dark:bg-blue-900 dark:text-blue-100"
  };
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 dark:border-gray-800 dark:focus:ring-gray-300 ${styles[variant]}`}>
      {children}
    </div>
  );
};

// --- Modal ---
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative z-50 w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200 sm:rounded-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left mb-4">
          <h3 className="text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-50">{title}</h3>
        </div>
        <div>{children}</div>
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-gray-100 data-[state=open]:text-gray-500 dark:ring-offset-gray-950 dark:focus:ring-gray-300 dark:data-[state=open]:bg-gray-800 dark:data-[state=open]:text-gray-400"
        >
          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  );
};

// --- Confirmation Modal ---
export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}> = ({ 
  isOpen, onClose, onConfirm, title, message, 
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'primary' 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="py-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 gap-2 sm:gap-0">
        <Button variant="outline" onClick={onClose}>{cancelText}</Button>
        <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
      </div>
    </Modal>
  );
};