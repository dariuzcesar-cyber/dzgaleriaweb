import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { listGalleries } from '@/lib/galleries';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return <AdminLogin />;
  }

  const galleries = await listGalleries();

  return (
    <AdminDashboard
      adminName={session.user.name ?? 'Dariuz Aceves'}
      adminEmail={session.user.email}
      initialGalleries={galleries}
    />
  );
}
