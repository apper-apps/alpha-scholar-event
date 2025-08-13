import { cn } from "@/utils/cn";

const Card = ({ 
  children, 
  className,
  hover = false,
  glass = false,
  ...props 
}) => {
  return (
    <div
      className={cn(
        "rounded-xl bg-white border border-gray-200 premium-shadow",
        hover && "hover:shadow-2xl hover:-translate-y-1 transition-all duration-300",
        glass && "glass-card",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6 pb-0", className)} {...props}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className, ...props }) => {
  return (
    <div className={cn("p-6 pt-0", className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;