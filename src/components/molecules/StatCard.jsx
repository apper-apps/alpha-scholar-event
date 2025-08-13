import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  change, 
  changeType = "positive",
  className 
}) => {
  return (
    <Card className={cn("hover:shadow-lg transition-shadow duration-200", className)} hover>
      <Card.Content className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold gradient-text">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                <ApperIcon
                  name={changeType === "positive" ? "TrendingUp" : "TrendingDown"}
                  className={cn(
                    "w-4 h-4 mr-1",
                    changeType === "positive" ? "text-success" : "text-error"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    changeType === "positive" ? "text-success" : "text-error"
                  )}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
              <ApperIcon name={icon} className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default StatCard;