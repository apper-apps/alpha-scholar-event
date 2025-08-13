import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: "LayoutDashboard", label: "Dashboard", href: "/" },
    { icon: "Users", label: "Students", href: "/students" },
    { icon: "BookOpen", label: "Classes", href: "/classes" },
    { icon: "Calendar", label: "Attendance", href: "/attendance" },
    { icon: "GraduationCap", label: "Grades", href: "/grades" }
  ];

  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 premium-shadow">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-bold gradient-text">Scholar Hub</h1>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-r-2 border-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <ApperIcon
                    name={item.icon}
                    className={cn(
                      "w-5 h-5 mr-3 transition-colors",
                      isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobile}
          className="p-2 rounded-lg bg-white shadow-lg border border-gray-200 text-gray-600 hover:text-primary transition-colors"
        >
          <ApperIcon name="Menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ApperIcon name="X" className="h-6 w-6 text-white" />
              </button>
            </div>

            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center px-6 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-bold gradient-text">Scholar Hub</h1>
              </div>
              
              <nav className="px-4 space-y-2">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-primary/10 to-primary/5 text-primary"
                          : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <ApperIcon
                          name={item.icon}
                          className={cn(
                            "w-5 h-5 mr-3",
                            isActive ? "text-primary" : "text-gray-400"
                          )}
                        />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;