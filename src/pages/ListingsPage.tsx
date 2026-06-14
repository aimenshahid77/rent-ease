import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/listings/SearchBar';
import { ListingCard } from '../components/listings/ListingCard';
import { useListings } from '../hooks/useListings';
import { Building2 } from 'lucide-react';

export default function ListingsPage() {
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('type') || 'all',
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    bedrooms: undefined as number | undefined,
  });

  const { data: listings, isLoading } = useListings(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">Find Your Home</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          {isLoading ? 'Searching...' : `${listings?.length || 0} properties found`}
          {filters.city ? ` in ${filters.city}` : ''}
        </p>
      </div>

      <SearchBar onSearch={setFilters} initialValues={filters} />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-900/30 rounded-2xl h-72 border border-slate-300 dark:border-slate-800" />
          ))}
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Building2 className="h-14 w-14 text-slate-400 dark:text-slate-700 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-300">No listings found</h2>
          <p className="text-slate-600 dark:text-slate-500 text-sm max-w-sm mx-auto">
            Try adjusting your search filters or browse all available properties.
          </p>
          <button
            onClick={() => setFilters({ city: '', propertyType: 'all', minPrice: undefined, maxPrice: undefined, bedrooms: undefined })}
            className="px-5 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl cursor-pointer hover:bg-primary/90"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
