import Sidebar from "@/components/organisms/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;