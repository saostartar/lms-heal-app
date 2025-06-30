'use client';

import Link from 'next/link';

export default function AdminSidebar({ pathname }) {
  const isActivePath = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const adminLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Courses', href: '/admin/courses' },
    { name: 'Users', href: '/admin/users' },
    { name: 'News', href: '/admin/news' },
    { name: 'Forum Management', href: '/admin/forum' },
    { name: 'Analytics', href: '/admin/analytics' },
  ];

  return (
    <div className="h-full flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <span className="text-lg font-semibold text-gray-800">Admin Dashboard</span>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1" aria-label="Sidebar">
          {adminLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActivePath(item.href)
                  ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
            >
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}