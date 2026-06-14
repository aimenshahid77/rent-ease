import { useParams } from 'react-router-dom';
import { ListingDetail } from '../components/listings/ListingDetail';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-screen py-4">
      <ListingDetail listingId={id!} />
    </div>
  );
}
