import '../commonStyle.css';
import '../PagesStyles/search.css';
import '../PagesStyles/hotelDetails.css';
import { getHotels, getRoomTypes } from '../api/hotelApi.js';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { showToast } from '../FunctionsofTheProject/HelperFunctions.js';

export function HotelDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    async function loadHotelDetails() {
      try {
        setLoading(true);

        const hotelsResponse = await getHotels();
        const hotels = hotelsResponse.content || hotelsResponse || [];

        const selectedHotel = hotels.find((h) => String(h.id) === String(id));

        setHotel(selectedHotel || null);

        if (selectedHotel) {
          setSelectedImage(selectedHotel.imageUrl);

          const roomsResponse = await getRoomTypes({
            page: 0,
            size: 100,
            sort: 'id,desc',
          });

          const allRooms = roomsResponse.content || [];

          const hotelRooms = allRooms.filter(
            (room) => String(room.hotelId) === String(selectedHotel.id)
          );

          setRoomTypes(hotelRooms);
        } else {
          setRoomTypes([]);
        }
      } catch (error) {
        console.error('Error fetching hotel details:', error);
      } finally {
        setLoading(false);
      }
    }

    loadHotelDetails();
  }, [id]);

  function openAuthModalFromHotelDetails() {
    document.getElementById('auth-modal')?.classList.add('open');

    document.getElementById('tab-login')?.classList.add('active');
    document.getElementById('tab-register')?.classList.remove('active');
  }

  function BookRoom(room) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      openAuthModalFromHotelDetails();
      showToast('Please sign in to book', 'info');
      return;
    }

    navigate('/booking', {
      state: {
        hotelId: hotel.id,
        roomId: room.id,
        hotelName: hotel.name,
        roomName: room.name,
        price: room.basePrice,
        hotelImageUrl: hotel.imageUrl,
      },
    });
  }

  const lowestRoomPrice = useMemo(() => {
    if (!roomTypes.length) return Number(hotel?.minPrice || 0);

    const prices = roomTypes
      .map((room) => Number(room.basePrice || room.pricePerNight || room.price || 0))
      .filter((price) => price > 0);

    if (!prices.length) return Number(hotel?.minPrice || 0);

    return Math.min(...prices);
  }, [roomTypes, hotel]);

  const totalAvailableRooms = useMemo(() => {
    return roomTypes.reduce((sum, room) => sum + Number(room.totalRooms || 0), 0);
  }, [roomTypes]);

  const galleryImages = useMemo(() => {
    if (!hotel) return [];

    return [
      {
        type: 'hotel',
        value: hotel.imageUrl,
        label: hotel.name,
      },
      ...roomTypes
        .filter((room) => room.imageUrl)
        .slice(0, 4)
        .map((room) => ({
          type: 'room',
          value: room.imageUrl,
          label: room.name,
        })),
    ].filter((image) => image.value);
  }, [hotel, roomTypes]);

  function selectThumb(imageUrl) {
    setSelectedImage(imageUrl);
  }

  if (loading) {
    return (
      <div className="page-active" id="page-hotel">
        <div className="hotel-details-shell hotel-details-state-shell">
          <div className="hotel-details-loading-card">
            <div className="hotel-details-loader"></div>
            <h2 className="amiri">Preparing your stay...</h2>
            <p>Loading hotel details, rooms, gallery, and availability.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="page-active" id="page-hotel">
        <div className="hotel-details-shell hotel-details-state-shell">
          <button className="btn btn-outline btn-sm hotel-back-btn" onClick={() => navigate('/search')}>
            ← Back to Search
          </button>

          <div className="hotel-details-loading-card">
            <div className="hotel-details-state-icon">🏨</div>
            <h2 className="amiri">Hotel not found</h2>
            <p>Please go back and choose another stay from the hotel collection.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedGalleryImage = selectedImage || hotel.imageUrl;

  return (
    <div className="page-active hotel-details-page" id="page-hotel">
      <div className="hotel-details-shell">
        <button className="btn btn-outline btn-sm hotel-back-btn" onClick={() => navigate('/search')}>
          ← Back to Hotels
        </button>

        <section className="hotel-hero-card fade-in">
          <div className="hotel-hero-media">
            <div className="gallery-main hotel-hero-main-image">
              {selectedGalleryImage ? (
                <img id="gallery-main-img" src={selectedGalleryImage} alt={hotel.name} />
              ) : (
                <div className="hotel-image-fallback">🏨</div>
              )}
              <div className="hotel-main-image-shade"></div>
              <div className="hotel-hero-floating-badge">
                <span>{Number(hotel.rating || 0).toFixed(1)}</span>
                <strong>Guest rating</strong>
              </div>
            </div>

            <div className="gallery-thumbs hotel-gallery-thumbs">
              {galleryImages.map((img, index) => (
                <button
                  type="button"
                  key={`${img.value}-${index}`}
                  className={`gallery-thumb hotel-gallery-thumb${selectedGalleryImage === img.value ? ' active' : ''}`}
                  onClick={() => selectThumb(img.value)}
                  title={img.label}
                >
                  <img src={img.value} alt={img.label} />
                  <span>{img.type === 'hotel' ? 'Hotel' : 'Room'}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hotel-hero-content">
            <div className="hotel-badge-row">
              <span className="badge badge-gold hotel-stars-badge">{'⭐'.repeat(Number(hotel.stars || 0))}</span>
              <span className="badge badge-emerald">✓ Verified stay</span>
              <span className="hotel-soft-pill">No hidden UI clutter</span>
            </div>

            <p className="hotel-eyebrow">Luxury hotel collection</p>
            <h1 className="amiri hotel-title">{hotel.name}</h1>

            <div className="hotel-location-row">
              <span>📍 {hotel.city}</span>
              <span className="hotel-dot">•</span>
              <span>{hotel.rating ?? '-'} rating</span>
              <span className="hotel-dot">•</span>
              <span>{hotel.reviews ?? 0} reviews</span>
            </div>

            <p className="hotel-description">{hotel.description}</p>

            <div className="hotel-experience-grid">
              <div className="hotel-experience-card">
                <span>From</span>
                <strong>${Number(lowestRoomPrice || 0).toLocaleString()}</strong>
                <small>per night</small>
              </div>
              <div className="hotel-experience-card">
                <span>Rooms</span>
                <strong>{roomTypes.length}</strong>
                <small>room types</small>
              </div>
              <div className="hotel-experience-card">
                <span>Available</span>
                <strong>{totalAvailableRooms || '—'}</strong>
                <small>rooms listed</small>
              </div>
            </div>

            <div className="hotel-amenities-panel">
              <div className="hotel-section-mini-title">✦ What guests love</div>

              <div className="hotel-amenities-grid">
                {(hotel.amenities || []).slice(0, 8).map((amenity) => (
                  <div className="amenity hotel-amenity-chip" key={amenity}>
                    <span>✓</span>
                    {amenity}
                  </div>
                ))}

                {(hotel.amenities || []).length === 0 && (
                  <div className="hotel-muted-note">Amenities will appear here when available.</div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="hotel-booking-strip fade-in">
          <div>
            <span>Best available selection</span>
            <strong>Choose your room and continue securely</strong>
          </div>
          <div className="hotel-booking-strip-tags">
            <span>✓ Instant request</span>
            <span>✓ Secure checkout</span>
            <span>✓ Premium stay flow</span>
          </div>
        </section>

        <section className="hotel-detail-layout fade-in">
          <main className="hotel-rooms-column">
            <div className="hotel-section-header-row">
              <div>
                <p className="hotel-eyebrow">Available options</p>
                <h2 className="amiri hotel-section-title">Choose your room</h2>
              </div>
              <span className="hotel-room-count">{roomTypes.length} room types</span>
            </div>

            {roomTypes.length > 0 ? (
              <div className="hotel-room-list">
                {roomTypes.map((room) => {
                  const roomPrice = Number(room.basePrice || room.pricePerNight || room.price || 0);

                  return (
                    <article key={room.id} className="room-card hotel-room-card">
                      <div className="hotel-room-image-wrap">
                        {room.imageUrl ? (
                          <img src={room.imageUrl} alt={room.name} />
                        ) : (
                          <div className="hotel-room-fallback">🛏</div>
                        )}
                        <div className="hotel-room-image-badge">Room choice</div>
                      </div>

                      <div className="hotel-room-content">
                        <div className="hotel-room-main">
                          <div className="hotel-room-title-row">
                            <div>
                              <h3 className="amiri">{room.name}</h3>
                              <p>{room.hotelName || hotel.name}</p>
                            </div>
                            <span className="hotel-room-capacity">👥 Up to {room.capacity || '-'} guests</span>
                          </div>

                          <div className="hotel-room-feature-grid">
                            <span>🛏 {room.totalRooms || '-'} total rooms</span>
                            <span>🌙 Flexible stay</span>
                            <span>🔒 Secure booking</span>
                          </div>

                          <p className="hotel-room-amenities">{room.amenities || 'Room amenities will be shown here when available.'}</p>
                        </div>

                        <div className="hotel-room-price-panel">
                          <span>Tonight's rate</span>
                          <strong>${roomPrice.toLocaleString()}</strong>
                          <small>per night</small>

                          <button className="btn btn-primary btn-sm" onClick={() => BookRoom(room)}>
                            Reserve room →
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state hotel-empty-rooms">
                <div className="empty-icon">🛏</div>
                <div>No room types available for this hotel</div>
              </div>
            )}
          </main>

          <aside className="hotel-stay-summary-card">
            <div className="hotel-summary-image" style={{ backgroundImage: `url(${hotel.imageUrl || ''})` }}>
              <div>
                <span>Featured stay</span>
                <strong>{hotel.name}</strong>
              </div>
            </div>

            <div className="hotel-summary-body">
              <div className="hotel-summary-row">
                <span>Location</span>
                <strong>{hotel.city || '-'}</strong>
              </div>
              <div className="hotel-summary-row">
                <span>Rating</span>
                <strong>{hotel.rating ?? '-'} / 10</strong>
              </div>
              <div className="hotel-summary-row">
                <span>Reviews</span>
                <strong>{hotel.reviews ?? 0}</strong>
              </div>
              <div className="hotel-summary-row">
                <span>Starting from</span>
                <strong>${Number(lowestRoomPrice || 0).toLocaleString()}</strong>
              </div>

              <div className="hotel-summary-note">
                Select a room to move into the premium checkout flow.
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
