import { Outlet } from '@tanstack/react-router';
import TopSegmentedNav from './TopSegmentedNav';

export default function SiteLayout() {
  return (
    <div className="relative min-h-screen bg-pastel-surface">
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/assets/generated/admin-bg.dim_1600x900.png)' }}
      />
      <div className="relative z-10 min-h-screen flex flex-col">
        <TopSegmentedNav />
        <main className="flex-1 page-transition pb-16">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm text-gray-600 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <p>
            © {new Date().getFullYear()} Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
