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

  function getStartingPrice(hotel) {
    const roomPrices = getRoomTypes(hotel)
      .map((room) => Number(room.basePrice || room.pricePerNight || room.price || 0))
      .filter((price) => price > 0);

    if (Number(hotel.minPrice || 0) > 0) return Number(hotel.minPrice);
    if (roomPrices.length > 0) return Math.min(...roomPrices);
    return 0;
  }

  function formatMoney(value) {
    const number = Number(value || 0);
    return `$${number.toLocaleString()}`;
  }

  function getRatingLabel(rating) {
    const value = Number(rating || 0);
    if (value >= 4.7) return 'Exceptional';
    if (value >= 4.3) return 'Wonderful';
    if (value >= 4) return 'Very good';
    if (value >= 3.5) return 'Good';
    return 'Guest rated';
  }

  function getAmenities(hotel) {
    if (Array.isArray(hotel.amenities)) return hotel.amenities;
    if (typeof hotel.amenities === 'string') {
      return hotel.amenities
        .split(',')
        .map((amenity) => amenity.trim())
        .filter(Boolean);
    }

    return [];
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

  const featuredHotel = useMemo(() => {
    if (HOTELS.length === 0) return null;

    return [...HOTELS].sort((a, b) => {
      const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b.reviews || 0) - Number(a.reviews || 0);
    })[0];
  }, [HOTELS]);

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
      <div className="page-active hotels-page" id="page-search">
        <div className="hotels-loading-shell">
          <div className="hotels-loader-card">
            <div className="hotels-loader-visual">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <h2 className="amiri">Finding exceptional stays...</h2>
            <p>Curating hotel options, rooms, ratings, and amenities for you.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-active hotels-page" id="page-search">
        <div className="container hotels-error-container">
          <div className="hotels-empty-panel">
            <div className="hotels-empty-icon">⚠️</div>
            <h2 className="amiri">We couldn’t load the hotel collection</h2>
            <p>{error}</p>
            <button className="btn btn-outline btn-sm" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-active hotels-page" id="page-search">
      <section className="hotels-hero-shell">
        <div className="container hotels-hero">
          <div className="hotels-hero-copy">
            <div className="hotels-eyebrow">Curated luxury stays</div>
            <h1 className="amiri">Find your next memorable stay</h1>
            <p>
              Browse premium hotels with verified details, room options, guest ratings,
              and a refined booking experience inspired by world-class travel platforms.
            </p>

            <div className="hotels-hero-stats" aria-label="Hotel search summary">
              <div>
                <strong>{HOTELS.length}</strong>
                <span>listed hotels</span>
              </div>
              <div>
                <strong>{cityOptions.length}</strong>
                <span>destinations</span>
              </div>
              <div>
                <strong>{roomTypeOptions.length}</strong>
                <span>room styles</span>
              </div>
            </div>
          </div>

          {featuredHotel && (
            <button
              className="hotels-feature-card"
              onClick={() => viewHotel(featuredHotel)}
              type="button"
              aria-label={`Open ${featuredHotel.name}`}
            >
              <div
                className="hotels-feature-image"
                style={{
                  backgroundImage: featuredHotel.imageUrl
                    ? `url(${featuredHotel.imageUrl})`
                    : featuredHotel.color || 'linear-gradient(135deg,#0369a1,#0f766e)',
                }}
              >
                <div className="hotels-feature-badge">Top pick</div>
              </div>
              <div className="hotels-feature-content">
                <span>{featuredHotel.city || 'Featured destination'}</span>
                <strong>{featuredHotel.name}</strong>
                <div>
                  {getRatingLabel(featuredHotel.rating)} · {featuredHotel.rating ?? '-'} ·{' '}
                  {featuredHotel.reviews ?? 0} reviews
                </div>
              </div>
            </button>
          )}
        </div>
      </section>

      <div className="container hotels-search-container">
        <div className="hotels-search-strip">
          <div className="hotels-search-item">
            <label>Destination</label>
            <select className="form-input" name="city" value={filters.city} onChange={handleFilterChange}>
              <option value="">All cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="hotels-search-item">
            <label>Room type</label>
            <select
              className="form-input"
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
            >
              <option value="">Any room</option>
              {roomTypeOptions.map((roomType) => (
                <option key={roomType} value={roomType}>
                  {roomType}
                </option>
              ))}
            </select>
          </div>

          <div className="hotels-search-item hotels-search-item-small">
            <label>Guests</label>
            <select className="form-input" name="guests" value={filters.guests} onChange={handleFilterChange}>
              <option value="">Any</option>
              {guestOptions.map((guestCount) => (
                <option key={guestCount} value={guestCount}>
                  {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary hotels-search-action" type="button">
            Search stays
          </button>
        </div>

        <div className="search-layout hotels-results-layout">
          <aside className="filters-panel hotels-filter-panel">
            <div className="filters-heading">
              <span>✦ Filters</span>
              <button type="button" onClick={resetFilters}>Clear</button>
            </div>

            <div className="filter-summary-card">
              <strong>{filteredHotels.length}</strong>
              <span>properties match your current search</span>
            </div>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <select className="form-input" name="city" value={filters.city} onChange={handleFilterChange}>
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
              <select className="form-input" name="guests" value={filters.guests} onChange={handleFilterChange}>
                <option value="">Any Guests</option>
                {guestOptions.map((guestCount) => (
                  <option key={guestCount} value={guestCount}>
                    {guestCount} {guestCount === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-trust-card">
              <div>✓ No hidden visual clutter</div>
              <div>✓ Curated hotel collection</div>
              <div>✓ Fast reservation flow</div>
            </div>

            <button className="btn btn-outline filters-reset-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </aside>

          <main className="hotels-results-panel">
            <div className="hotels-results-topbar">
              <div>
                <span className="hotels-results-count">{filteredHotels.length} hotels found</span>
                <p>Sorted by a premium recommended experience</p>
              </div>

              <div className="hotels-view-chip">List view · premium cards</div>
            </div>

            <div className="hotels-list">
              {visibleHotels.length > 0 ? (
                visibleHotels.map((hotel) => {
                  const amenities = getAmenities(hotel).slice(0, 4);
                  const startingPrice = getStartingPrice(hotel);
                  const roomCount = getRoomTypes(hotel).length;

                  return (
                    <article key={hotel.id} className="hotel-card hotel-result-card">
                      <button
                        type="button"
                        className="hotel-image-panel"
                        onClick={() => viewHotel(hotel)}
                        aria-label={`View ${hotel.name}`}
                        style={{
                          backgroundImage: hotel.imageUrl
                            ? `url(${hotel.imageUrl})`
                            : hotel.color || 'linear-gradient(135deg,#0369a1,#0f766e)',
                        }}
                      >
                        {!hotel.imageUrl && <span className="hotel-image-placeholder">🏨</span>}
                        <span className="hotel-photo-count">Premium stay</span>
                        <span className="hotel-stars-floating">
                          {'⭐'.repeat(Number(hotel.stars || 0)) || 'Featured'}
                        </span>
                      </button>

                      <div className="hotel-result-body">
                        <div className="hotel-result-main">
                          <div className="hotel-result-kicker">
                            <span>{hotel.city || 'Luxury destination'}</span>
                            {roomCount > 0 && <span>{roomCount} room options</span>}
                          </div>

                          <button type="button" className="hotel-title-btn" onClick={() => viewHotel(hotel)}>
                            {hotel.name}
                          </button>

                          <div className="hotel-location-line">📍 {hotel.address || hotel.city || 'Prime hotel location'}</div>

                          {hotel.description && (
                            <p className="hotel-description">
                              {hotel.description.length > 150
                                ? `${hotel.description.slice(0, 150)}...`
                                : hotel.description}
                            </p>
                          )}

                          <div className="hotel-amenities-row">
                            {amenities.length > 0 ? (
                              amenities.map((amenity) => <span key={amenity}>{amenity}</span>)
                            ) : (
                              <>
                                <span>Free WiFi</span>
                                <span>Comfort rooms</span>
                                <span>Guest support</span>
                              </>
                            )}
                          </div>
                        </div>

                        <aside className="hotel-booking-panel">
                          <div className="hotel-rating-box">
                            <div>
                              <strong>{getRatingLabel(hotel.rating)}</strong>
                              <span>{hotel.reviews ?? 0} reviews</span>
                            </div>
                            <b>{hotel.rating ?? '-'}</b>
                          </div>

                          <div className="hotel-price-box">
                            <span>Starting from</span>
                            <strong>{startingPrice > 0 ? formatMoney(startingPrice) : 'View rates'}</strong>
                            <small>per night</small>
                          </div>

                          <button className="btn btn-primary hotel-view-btn" onClick={() => viewHotel(hotel)}>
                            See availability
                          </button>
                          <button className="hotel-subtle-link" type="button" onClick={() => viewHotel(hotel)}>
                            View hotel details
                          </button>
                        </aside>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="hotels-empty-panel">
                  <div className="hotels-empty-icon">🏨</div>
                  <h2 className="amiri">No hotels match your filters</h2>
                  <p>Try changing the destination, room type, or guest count.</p>
                  <button className="btn btn-outline btn-sm" onClick={resetFilters}>
                    Reset Filters
                  </button>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination hotels-pagination">
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
          </main>
        </div>
      </div>
    </div>
  );
}
