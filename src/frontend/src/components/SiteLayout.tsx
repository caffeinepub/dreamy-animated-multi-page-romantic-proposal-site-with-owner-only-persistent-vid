import { Outlet } from '@tanstack/react-router';
import TopSegmentedNav from './TopSegmentedNav';
import ProfileSetupModal from './ProfileSetupModal';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '@/hooks/useUserProfile';

export default function SiteLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="relative min-h-screen bg-sand-50">
      <div className="relative z-10 min-h-screen flex flex-col">
        <TopSegmentedNav />
        <main className="flex-1 page-transition pb-16">
          <Outlet />
        </main>
        <footer className="py-6 text-center text-sm text-sand-600 border-t border-sand-200 bg-sand-50/80 backdrop-blur-sm">
          <p>
            © {new Date().getFullYear()} Built with love using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}
