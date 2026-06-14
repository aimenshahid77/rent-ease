import { useParams } from "react-router-dom";
import { ListingDetail } from "../components/listings/ListingDetail";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <ListingDetail listingId={id!} />
    </div>
  );
}
