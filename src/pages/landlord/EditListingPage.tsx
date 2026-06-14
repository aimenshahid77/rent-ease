import { useParams } from 'react-router-dom';
import { EditListingForm } from '../../components/listings/EditListingForm';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <EditListingForm listingId={id!} />
    </div>
  );
}
