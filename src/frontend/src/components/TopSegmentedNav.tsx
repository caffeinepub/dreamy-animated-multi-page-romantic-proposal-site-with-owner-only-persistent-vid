import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { MessageSquare, Upload, Shield, ListChecks } from 'lucide-react';
import LoginButton from './LoginButton';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '@/hooks/useActor';

export default function TopSegmentedNav() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { identity } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const currentPath = routerState.location.pathname;

  const { data: isAdmin = false } = useQuery({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching && !!identity,
  });

  const sections = [
    { path: '/', label: 'Customer View', icon: MessageSquare },
    { path: '/upload', label: 'Upload Section', icon: Upload },
    { path: '/live-list', label: 'Live List Checker', icon: ListChecks },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin Panel', icon: Shield }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-sand-50/95 backdrop-blur-md border-b border-sand-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">
              APP REVIEW
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
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
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-md' 
                        : 'bg-sand-100 text-sand-800 hover:bg-sand-200'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </div>
            <LoginButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
