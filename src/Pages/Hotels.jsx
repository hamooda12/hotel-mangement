import '../commonStyle.css';
import '../PagesStyles/search.css';
import { getHotels } from '../api/hotelApi.js';
import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Hotels() {
  const navigate = useNavigate();

  const [HOTELS, setHotels] = useState([]);

  useEffect(() => {
    getHotels()
      .then((e) => {
        console.log(e.content);
        setHotels(e.content);
      })
      .catch((error) => {
        console.error('Error fetching hotels:', error);
      });
  }, []);

  const perPage = 4;

  const [currentHotel, setCurrentHotel] = useState(null);
  const [searchPage, setSearchPage] = useState(1);

  const [filters, setFilters] = useState({
    city: '',
    roomType: '',
    guests: '',
    maxPrice: 2500,
    sort: 'recommended',
  });

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
  }

  function viewHotel(hotel) {
    setCurrentHotel(hotel);
    navigate(`/hotel/${hotel.id}`);
  }

  function getRoomTypes(hotel) {
    return hotel.roomTypes || hotel.rooms || hotel.roomTypeList || [];
  }

  
  const filteredHotels = useMemo(() => {
    let result = HOTELS.filter((hotel) => {
      const roomTypes = getRoomTypes(hotel);

      const matchCity =
        filters.city === '' || hotel.city === filters.city;

      const matchRoomType =
        filters.roomType === '' ||
        roomTypes.some((room) => room.name === filters.roomType);

      const matchGuests =
        filters.guests === '' ||
        roomTypes.some((room) => Number(room.capacity) >= Number(filters.guests));

   

      return matchCity &&matchRoomType && matchGuests 
    });

  

    return result;
  }, [HOTELS, filters]);

  const totalPages = Math.ceil(filteredHotels.length / perPage);

  const visibleHotels = filteredHotels.slice(
    (searchPage - 1) * perPage,
    searchPage * perPage
  );

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
                <option value="Amman, Jordan">Amman, Jordan</option>
                <option value="Jerusalem, Israel">Jerusalem, Israel</option>
                <option value="Ramallah, Palestine">Ramallah, Palestine</option>
                <option value="Bethlehem, Palestine">Bethlehem, Palestine</option>
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
                <option value="Standard Room">Standard Room</option>
                <option value="Deluxe Suite">Deluxe Suite</option>
                <option value="Royal Penthouse">Royal Penthouse</option>
                <option value="Bosphorus View Room">Bosphorus View Room</option>
                <option value="Ottoman Suite">Ottoman Suite</option>
                <option value="Haramain View Room">Haramain View Room</option>
                <option value="Zam Zam Suite">Zam Zam Suite</option>
                <option value="Courtyard Room">Courtyard Room</option>
                <option value="Terrace Suite">Terrace Suite</option>
                <option value="Nile View Room">Nile View Room</option>
                <option value="Pharaoh Suite">Pharaoh Suite</option>
                <option value="Garden Room">Garden Room</option>
                <option value="Beach Suite">Beach Suite</option>
                <option value="Presidential Villa">Presidential Villa</option>
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
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4 Guests</option>
                <option value="5">5 Guests</option>
                <option value="6">6 Guests</option>
                <option value="8">8 Guests</option>
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

              <select
                className="form-input"
                style={{ width: 'auto', fontSize: '13px' }}
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
              >
                <option value="recommended">Sort: Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating-high">Rating: High to Low</option>
              </select>
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
                      <img src={hotel.imageUrl} alt={hotel.name} />

                      <div className="hotel-img-badge">
                        <span className="badge badge-gold">
                          {'⭐'.repeat(hotel.stars)}
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
      {'⭐'.repeat(Math.floor(hotel.rating || 0))}
    </div>

    <div
      style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}
    >
      {hotel.rating} ({hotel.reviews} reviews)
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