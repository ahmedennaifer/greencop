import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Server,
  Activity,
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  MessageSquare,
} from 'lucide-react';
import Button from '../ui/Button';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Assistant', href: '/assistant', icon: MessageSquare },
  ];

  const managementItems = [
    { name: 'Server Rooms', href: '/rooms', icon: Server },
    { name: 'Sensors', href: '/sensors', icon: Activity },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GreenCop</h1>
                <p className="text-xs text-gray-500">IoT Monitoring</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Management Section */}
            <div>
              <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Management
                </h3>
              </div>
              <div className="space-y-1">
                {managementItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{user?.username}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar / Navbar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Navbar Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link
                to="/assistant"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/assistant'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Assistant</span>
              </Link>
              <Link
                to="/rooms"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/rooms'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Rooms</span>
              </Link>
              <Link
                to="/sensors"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/sensors'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Sensors</span>
              </Link>
              <Link
                to="/alerts"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/alerts'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Alerts</span>
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{user?.username}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
