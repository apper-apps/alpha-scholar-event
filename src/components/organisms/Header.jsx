import React, { useContext, useState } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "@/App";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import Button from "@/components/atoms/Button";

const Header = ({ title, onSearch, showSearch = true }) => {
  const [notifications] = useState(3);

  const handleNotificationClick = () => {
    toast.info("No new notifications");
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="lg:hidden">
            {/* Mobile spacing for hamburger menu */}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back! Here's what's happening with your students today.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {showSearch && (
            <div className="hidden md:block">
              <SearchBar
                placeholder="Search students..."
                onSearch={onSearch}
                className="w-80"
              />
            </div>
          )}
          
<div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNotificationClick}
              className="relative p-2"
            >
              <ApperIcon name="Bell" className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </Button>

            <LogoutButton />

            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <ApperIcon name="User" className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
</div>
      </div>
    </div>
  );
};

function LogoutButton() {
  const { logout } = useContext(AuthContext);
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="p-2"
      title="Logout"
    >
      <ApperIcon name="LogOut" className="w-5 h-5" />
    </Button>
  );
}

export default Header;