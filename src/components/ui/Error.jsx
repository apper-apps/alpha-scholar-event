import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  title = "Something went wrong",
  message = "We encountered an error while loading your data. Please try again.",
  onRetry,
  showRetry = true
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <Card.Content className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-error/10 to-error/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name="AlertCircle" className="w-8 h-8 text-error" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="primary">
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default Error;