import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Role } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Sun,
  Moon,
  UserCog
} from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: [Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT] },
    { label: 'Users', path: '/users', icon: UserCog, roles: [Role.ADMIN] },
    { label: 'Batches', path: '/batches', icon: Users, roles: [Role.ADMIN] },
    { label: 'Assignments', path: '/assignments', icon: BookOpen, roles: [Role.INSTRUCTOR, Role.STUDENT] },
    { label: 'Grading', path: '/grading', icon: GraduationCap, roles: [Role.INSTRUCTOR] },
    { label: 'Settings', path: '/settings', icon: Settings, roles: [Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT] },
  ];

  const filteredNavItems = navItems.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-200">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-gray-50 text-white dark:text-gray-950 flex items-center justify-center font-bold text-lg">N</div>
            <span className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">NexusLMS</span>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50'}
                `}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold overflow-hidden shrink-0">
                {user?.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : user?.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
               <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user?.role.toLowerCase()}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-md transition-colors border border-gray-200 dark:border-gray-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50 dark:bg-gray-950/50">
        {/* Header */}
        <header className="h-16 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 lg:px-8 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-md transition-colors"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};