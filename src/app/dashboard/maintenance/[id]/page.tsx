import MaintenanceDetailsPage from '@/components/pages/MaintenanceDetailsPageUniversal';

export default function MaintenanceDetails({ params }: { params: { id: string } }) {
  return <MaintenanceDetailsPage requestId={params.id} />;
}
