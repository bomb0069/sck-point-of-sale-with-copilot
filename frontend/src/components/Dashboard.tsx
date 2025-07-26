import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Store,
  TrendingUp,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const quickStats = [
    {
      name: 'Today\'s Sales',
      value: '฿99,662.50',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600 bg-green-100',
    },
    {
      name: 'Transactions',
      value: '47',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      name: 'Products',
      value: '1,234',
      change: '+2.1%',
      icon: Package,
      color: 'text-purple-600 bg-purple-100',
    },
    {
      name: 'Customers',
      value: '892',
      change: '+15.3%',
      icon: Users,
      color: 'text-orange-600 bg-orange-100',
    },
  ];

  const quickActions = [
    {
      name: 'Start Sale',
      description: 'Process new transaction',
      href: '/pos',
      icon: ShoppingCart,
      color: 'bg-primary-600 hover:bg-primary-700',
    },
    {
      name: 'Manage Products',
      description: 'Add, edit, or view products',
      href: '/products',
      icon: Package,
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'View Customers',
      description: 'Manage customer database',
      href: '/customers',
      icon: Users,
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Sales Reports',
      description: 'View sales analytics',
      href: '/reports',
      icon: BarChart3,
      color: 'bg-purple-600 hover:bg-purple-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
          <div className="py-6 md:flex md:items-center md:justify-between lg:border-t lg:border-gray-200">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <Store className="hidden md:block flex-shrink-0 mr-1.5 h-8 w-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                    Welcome back, {user?.full_name}
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} Dashboard
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat) => (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className={`relative group ${action.color} p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-white rounded-lg shadow-sm text-white hover:shadow-md transition-all duration-200`}
              >
                <div>
                  <span className="rounded-lg inline-flex p-3 bg-white bg-opacity-20">
                    <action.icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-white text-opacity-90">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="text-center text-gray-500">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No recent activity</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start making sales to see activity here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
