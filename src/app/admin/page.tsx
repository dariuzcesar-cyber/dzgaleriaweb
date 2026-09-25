import { getAdminSession } from '@/lib/googleAuth';
import AdminLogin from '@/components/AdminLogin';
import AdminDashboard from '@/components/AdminDashboard';
import { listGalleries } from '@/lib/galleries';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export default async function AdminPage() {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLogin />;
  }

  const galleries = await listGalleries();

  return (
    <AdminDashboard
      adminName={session.name ?? 'Dariuz Aceves'}
      adminEmail={session.email}
      initialGalleries={galleries}
    />
  );
}
