import { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import LoadingComponent from './Loading';
import { Heart } from 'lucide-react';
import useFetchPhotos from './useFetchPhotos';

const FAVORITES_STORAGE_KEY = 'favoritePhotoIds';

const loadFavoriteIds = () => {
  try {
    const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (storedFavorites === null) return [];

    const favoriteIds = JSON.parse(storedFavorites);
    if (!Array.isArray(favoriteIds) || !favoriteIds.every((id) => typeof id === 'string')) {
      throw new Error('Stored favorites must be an array of photo IDs.');
    }

    return favoriteIds;
  } catch (error) {
    console.error('Unable to load favorite photos from localStorage.', error);
    return [];
  }
};

const favoritesReducer = (favoriteIds, action) => {
  switch (action.type) {
    case 'toggle':
      return favoriteIds.includes(action.id)
        ? favoriteIds.filter((id) => id !== action.id)
        : [...favoriteIds, action.id];
    default:
      return favoriteIds;
  }
};

const Gallery = () => {
  const { photos, loading, error } = useFetchPhotos();
  const [search, setSearch] = useState('');
  const [favoriteIds, dispatchFavorite] = useReducer(favoritesReducer, undefined, loadFavoriteIds);

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
  }, []);

  const filteredPhotos = useMemo(
    () => photos.filter((photo) => photo.author.toLowerCase().includes(search.toLowerCase())),
    [photos, search],
  );

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch (error) {
      console.error('Unable to save favorite photos to localStorage.', error);
    }
  }, [favoriteIds]);

  if (loading) return <div className='flex min-h-screen items-center justify-center'><LoadingComponent isLoading={loading}/></div>;
  if (error) return <p>Error loading photos: {error}</p>;

  return (
    <div>
      <div className='flex justify-center'>
        <input type='text' placeholder='Search Author' value={search} onChange={handleSearchChange} className='border-2 border-gray-500 rounded-2xl p-4' />
      </div>
      <div className='grid grid-cols-1 gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4'>

        {filteredPhotos.map((photo) => (
            <div key={photo.id} className='overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm transition-shadow'>
              <img
                src={photo.download_url}
                className='h-auto rounded-md object-cover' />
              <div className='flex items-center justify-between'>
                <p className='text-lg font-bold'>{photo.author}</p>
                <button
                  type='button'
                  aria-label={favoriteIds.includes(photo.id) ? 'Remove from favorites' : 'Add to favorites'}
                  aria-pressed={favoriteIds.includes(photo.id)}
                  onClick={() => dispatchFavorite({ type: 'toggle', id: photo.id })}
                >
                  <Heart
                    color='grey'
                    fill={favoriteIds.includes(photo.id) ? 'red' : 'white'}
                    strokeWidth={1.5}
                    size={28}
                  />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default Gallery;