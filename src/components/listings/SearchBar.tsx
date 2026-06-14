import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search, Home, DollarSign, MapPin } from 'lucide-react';

const searchSchema = z.object({
  city: z.string().optional(),
  propertyType: z.enum(['all', 'room', 'apartment', 'house', 'studio']).optional(),
  minPrice: z.number().optional().or(z.literal('')),
  maxPrice: z.number().optional().or(z.literal('')),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface SearchBarProps {
  onSearch: (filters: any) => void;
  initialValues?: any;
}

export const SearchBar = ({ onSearch, initialValues }: SearchBarProps) => {
  const { control, handleSubmit } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      city: initialValues?.city || '',
      propertyType: initialValues?.propertyType || 'all',
      minPrice: initialValues?.minPrice || '',
      maxPrice: initialValues?.maxPrice || '',
    },
  });

  const onSubmit = (data: SearchFormData) => {
    // Format numbers
    const formattedData = {
      ...data,
      minPrice: data.minPrice === '' ? undefined : Number(data.minPrice),
      maxPrice: data.maxPrice === '' ? undefined : Number(data.maxPrice),
    };
    onSearch(formattedData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-2 md:items-center"
    >
      <div className="flex-1 md:border-r border-slate-100 px-3 py-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1">City</label>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                {...field}
                type="text"
                placeholder="Enter city"
                className="w-full pl-6 bg-transparent text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none"
              />
            </div>
          )}
        />
      </div>

      <div className="flex-1 md:border-r border-slate-100 px-3 py-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
        <Controller
          name="propertyType"
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Home className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <select
                {...field}
                className="w-full pl-6 bg-transparent text-slate-900 text-sm font-medium focus:outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="room">Room</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="studio">Studio</option>
              </select>
            </div>
          )}
        />
      </div>

      <div className="flex-1 md:border-r border-slate-100 px-3 py-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Min Price</label>
        <Controller
          name="minPrice"
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <div className="relative">
              <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                {...rest}
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                placeholder="No min"
                className="w-full pl-6 bg-transparent text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none"
              />
            </div>
          )}
        />
      </div>

      <div className="flex-1 px-3 py-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Max Price</label>
        <Controller
          name="maxPrice"
          control={control}
          render={({ field: { value, onChange, ...rest } }) => (
            <div className="relative">
              <DollarSign className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <input
                {...rest}
                value={value}
                onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                placeholder="No max"
                className="w-full pl-6 bg-transparent text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none"
              />
            </div>
          )}
        />
      </div>

      <div className="px-2 pb-2 md:pb-0">
        <button
          type="submit"
          className="w-full md:w-auto px-8 py-3.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </form>
  );
};
