import { redirect } from 'next/navigation';
import { getAuthSession } from '@/lib/auth';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  
  if (!session?.user?.id) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        <Header 
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
        />
        
        <main className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}