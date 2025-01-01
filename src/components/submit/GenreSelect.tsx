import { Music } from 'lucide-react';

const genres = [
  { id: 'pop', name: 'Pop' },
  { id: 'rock', name: 'Rock' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'classical', name: 'Classical' },
  { id: 'edm', name: 'EDM' },
  { id: 'hiphop', name: 'Hip Hop' },
  { id: 'ambient', name: 'Ambient' },
];

interface GenreSelectProps {
  value: string;
  onChange: (genre: string) => void;
  error?: string;
}

export function GenreSelect({ value, onChange, error }: GenreSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Genre<span className="text-red-500 ml-1">*</span>
      </label>
      <div className="relative">
        <Music className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className={`
            w-full pl-10 pr-10 py-2 appearance-none bg-white rounded-lg border
            ${error ? 'border-red-500' : 'border-gray-300'}
            focus:ring-2 focus:ring-purple-500 focus:border-transparent
          `}
        >
          <option value="">Select a genre</option>
          {genres.map((genre) => (
            <option key={genre.id} value={genre.id}>
              {genre.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}