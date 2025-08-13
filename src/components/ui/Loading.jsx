import Card from "@/components/atoms/Card";

const Loading = ({ type = "default" }) => {
  if (type === "table") {
    return (
      <Card>
        <div className="animate-pulse">
          {/* Table header */}
          <div className="bg-surface border-b border-gray-200 px-6 py-4">
            <div className="flex space-x-4">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          
          {/* Table rows */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                <div className="h-4 bg-gray-300 rounded w-20"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                  <div className="h-8 w-8 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <Card.Content>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-12">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <div className="mt-4 text-center">
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    </div>
  );
};

export default Loading;