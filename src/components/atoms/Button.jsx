import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  children, 
  className, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white shadow-lg hover:shadow-xl focus:ring-primary transform hover:scale-[1.02]",
    secondary: "bg-gradient-to-r from-secondary to-green-600 hover:from-green-600 hover:to-secondary text-white shadow-lg hover:shadow-xl focus:ring-secondary transform hover:scale-[1.02]",
    accent: "bg-gradient-to-r from-accent to-purple-600 hover:from-purple-600 hover:to-accent text-white shadow-lg hover:shadow-xl focus:ring-accent transform hover:scale-[1.02]",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-300",
    danger: "bg-gradient-to-r from-error to-red-600 hover:from-red-600 hover:to-error text-white shadow-lg hover:shadow-xl focus:ring-error transform hover:scale-[1.02]"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;