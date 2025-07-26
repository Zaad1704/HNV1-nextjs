import PropertyDetailsPage from '@/components/pages/PropertyDetailsPage';

export default function PropertyDetails({ params }: { params: { id: string } }) {
  return <PropertyDetailsPage propertyId={params.id} />;
}
