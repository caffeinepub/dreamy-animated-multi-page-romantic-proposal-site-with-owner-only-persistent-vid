import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useAdminToken } from '@/hooks/useAdminToken';
import { MessageSquare, Upload, Shield } from 'lucide-react';

export default function TopSegmentedNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { isAdmin } = useAdminToken();
  const currentPath = routerState.location.pathname;

  const sections = [
    { path: '/', label: 'Customer View', icon: MessageSquare },
    { path: '/upload', label: 'Upload Section', icon: Upload },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = currentPath === section.path;
            return (
              <button
                key={section.path}
                onClick={() => navigate({ to: section.path })}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-teal-400 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
