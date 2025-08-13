import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  message = "Get started by creating your first item.",
  icon = "Search",
  actionLabel = "Get Started",
  onAction,
  showAction = true
}) => {
  return (
    <Card className="max-w-md mx-auto">
      <Card.Content className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ApperIcon name={icon} className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {showAction && onAction && (
          <Button onClick={onAction} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </Card.Content>
    </Card>
  );
};

export default Empty;