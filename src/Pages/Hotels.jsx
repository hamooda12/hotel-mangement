import '../commonStyle.css';
import '../PagesStyles/search.css';
import { getHotels } from '../api/hotelApi.js';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function Hotels() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [HOTELS, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const perPage = 4;
  const [searchPage, setSearchPage] = useState(1);

  const [filters, setFilters] = useState({
    city: '',
    roomType: '',
    guests: '',
    maxPrice: 2500,
    sort: 'recommended',
  });

  useEffect(() => {
    async function loadHotels() {
      try {
        setLoading(true);
        setError('');

        const data = await getHotels({ size: 100 });

        if (Array.isArray(data)) {
          setHotels(data);
        } else if (Array.isArray(data?.content)) {
          setHotels(data.content);
        } else {
          setHotels([]);
        }
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setError('Failed to load hotels.');
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, []);

  useEffect(() => {
    const city = searchParams.get('city') || '';
    const roomType = searchParams.get('roomType') || '';
    const guests = searchParams.get('guests') || '';

    setFilters((prev) => ({
      ...prev,
      city,
      roomType,
      guests,
    }));

    setSearchPage(1);
  }, [searchParams]);

  function getRoomTypes(hotel) {
    return hotel.roomTypes || hotel.rooms || hotel.roomTypeList || [];
  }

  function getRoomName(room) {
    return room.name || room.typeName || room.roomTypeName || '';
  }

  function getRoomCapacity(room) {
    return Number(room.capacity || room.maxGuests || room.guests || 0);
  }

  const cityOptions = useMemo(() => {
    return [...new Set(HOTELS.map((hotel) => hotel.city).filter(Boolean))].sort();
  }, [HOTELS]);

  const roomTypeOptions = useMemo(() => {
    const names = HOTELS.flatMap((hotel) => getRoomTypes(hotel))
      .map((room) => getRoomName(room))
      .filter(Boolean);

    return [...new Set(names)].sort();
  }, [HOTELS]);

  const maxGuests = useMemo(() => {
    const capacities = HOTELS.flatMap((hotel) => getRoomTypes(hotel))
      .map((room) => getRoomCapacity(room))
      .filter((capacity) => capacity > 0);

    if (capacities.length === 0) return 1;

    return Math.max(...capacities);
  }, [HOTELS]);

  const guestOptions = useMemo(() => {
    return Array.from({ length: maxGuests }, (_, index) => index + 1);
  }, [maxGuests]);

  function handleFilterChange(e) {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSearchPage(1);
  }

  function resetFilters() {
    setFilters({
      city: '',
      roomType: '',
      guests: '',
      maxPrice: 2500,
      sort: 'recommended',
    });

    setSearchPage(1);
    navigate('/search', { replace: true });
  }

  function viewHotel(hotel) {
    navigate(`/hotel/${hotel.id}`);
  }

  const filteredHotels = useMemo(() => {
    return HOTELS.filter((hotel) => {
      const roomTypes = getRoomTypes(hotel);

      const matchCity = filters.city === '' || hotel.city === filters.city;

      const matchRoomType =
        filters.roomType === '' ||
        roomTypes.some((room) => getRoomName(room) === filters.roomType);

      const matchGuests =
        filters.guests === '' ||
        roomTypes.some(
          (room) => getRoomCapacity(room) >= Number(filters.guests)
        );

      return matchCity && matchRoomType && matchGuests;
    });
  }, [HOTELS, filters]);

  const totalPages = Math.ceil(filteredHotels.length / perPage);

  const visibleHotels = filteredHotels.slice(
    (searchPage - 1) * perPage,
    searchPage * perPage
  );

  if (loading) {
    return (
      <div className="page-active" id="page-search">
        <div className="container" style={{ padding: '3rem 0' }}>
          <h2 className="amiri" style={{ color: 'var(--navy)' }}>
            Loading hotels...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-active" id="page-search">
        <div className="container" style={{ padding: '3rem 0' }}>
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <div>{error}</div>
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-active" id="page-search">
      <div className="container">
        <div style={{ padding: '2rem 0 1rem' }}>
          <h1
            className="amiri"
            style={{ color: 'var(--navy)', fontSize: '2rem' }}
          >
            Discover Our Hotels
          </h1>

          <p style={{ color: 'var(--text-muted)' }}>
            Find your perfect stay across our curated collection
          </p>
        </div>

        <div className="search-layout">
          <div className="filters-panel">
            <h3
              style={{
                fontFamily: "'Amiri',serif",
                color: 'var(--navy)',
                marginBottom: '1.25rem',
                fontSize: '1.1rem',
              }}
            >
              ✦ Filters
            </h3>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <select
                className="form-input"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
              >
                <option value="">All Cities</option>

                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Room Type</label>
              <select
                className="form-input"
                name="roomType"
                value={filters.roomType}
                onChange={handleFilterChange}
              >
                <option value="">All Room Types</option>

                {roomTypeOptions.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Guests</label>
              <select
                className="form-input"
                name="guests"
                value={filters.guests}
                onChange={handleFilterChange}
              >
                <option value="">Any Guests</option>

                {guestOptions.map((guestCount) => (
                  <option key={guestCount} value={guestCount}>
                    {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: '0.5rem',
              }}
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>

          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {filteredHotels.length} hotels found
              </div>
            </div>

            <div className="hotels-grid">
              {visibleHotels.length > 0 ? (
                visibleHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    className="hotel-card"
                    onClick={() => viewHotel(hotel)}
                  >
                    <div
                      className="hotel-img"
                      style={{ background: hotel.color }}
                    >
                      {hotel.imageUrl ? (
                        <img src={hotel.imageUrl} alt={hotel.name} />
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '3rem',
                          }}
                        >
                          🏨
                        </div>
                      )}

                      <div className="hotel-img-badge">
                        <span className="badge badge-gold">
                          {'⭐'.repeat(Number(hotel.stars || 0))}
                        </span>
                      </div>
                    </div>

                    <div className="hotel-card-body">
                      <div className="hotel-name">{hotel.name}</div>

                      <div className="hotel-location">📍 {hotel.city}</div>

                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          flexWrap: 'wrap',
                          marginBottom: '12px',
                        }}
                      >
                        {(hotel.amenities || []).slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            style={{
                              fontSize: '11px',
                              background: 'var(--emerald-xlight)',
                              color: 'var(--emerald)',
                              padding: '3px 8px',
                              borderRadius: '20px',
                            }}
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      <div className="hotel-footer">
                        <div className="rating-center">
                          <div className="stars">
                            {'⭐'.repeat(Math.floor(Number(hotel.rating || 0)))}
                          </div>

                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {hotel.rating ?? '-'} ({hotel.reviews ?? 0} reviews)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                  <div className="empty-icon">🏨</div>

                  <div>No hotels match your filters</div>

                  <button
                    className="btn btn-outline btn-sm"
                    style={{ marginTop: '1rem' }}
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-btn${i + 1 === searchPage ? ' active' : ''}`}
                    onClick={() => setSearchPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
