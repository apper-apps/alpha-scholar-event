import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  size = "md",
  className,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-colors";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-gradient-to-r from-primary/10 to-blue-100 text-primary",
    secondary: "bg-gradient-to-r from-secondary/10 to-green-100 text-secondary",
    success: "bg-gradient-to-r from-success/10 to-green-100 text-success",
    warning: "bg-gradient-to-r from-warning/10 to-yellow-100 text-warning",
    error: "bg-gradient-to-r from-error/10 to-red-100 text-error",
    accent: "bg-gradient-to-r from-accent/10 to-purple-100 text-accent"
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-2.5 py-1.5 text-sm",
    lg: "px-3 py-2 text-base"
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;