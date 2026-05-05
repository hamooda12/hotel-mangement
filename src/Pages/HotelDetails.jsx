import '../commonStyle.css';
import '../PagesStyles/search.css';
import '../PagesStyles/hotelDetails.css'
import { getHotels, getRoomTypes } from '../api/hotelApi.js';
import { useEffect, useState } from 'react';
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

        const selectedHotel = hotels.find(
          (h) => String(h.id) === String(id)
        );

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
  document.getElementById("auth-modal")?.classList.add("open");

  document.getElementById("tab-login")?.classList.add("active");
  document.getElementById("tab-register")?.classList.remove("active");
}

function BookRoom(room) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    openAuthModalFromHotelDetails();
    showToast("Please sign in to book", "info");
    return;
  }

  navigate("/booking", {
    state: {
      hotelId: hotel.id,
      roomId: room.id,
      hotelName: hotel.name,
      roomName: room.name,
      price: room.basePrice,
    },
  });
}
  if (loading) {
    return (
      <div className="page-active" id="page-hotel">
        <div
          className="container"
          style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
        >
          <div className="empty-state">
            <div className="empty-icon">⏳</div>
            <div>Loading hotel...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="page-active" id="page-hotel">
        <div
          className="container"
          style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
        >
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate('/search')}
            style={{ marginBottom: '1.5rem' }}
          >
            ← Back to Search
          </button>

          <div className="empty-state">
            <div className="empty-icon">🏨</div>
            <div>Hotel not found</div>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = [
    {
      type: 'hotel',
      value: hotel.imageUrl,
      label: hotel.name,
    },
    ...roomTypes
      .filter((room) => room.imageUrl)
      .slice(0, 3)
      .map((room) => ({
        type: 'room',
        value: room.imageUrl,
        label: room.name,
      })),
  ];

  function selectThumb(imageUrl) {
    setSelectedImage(imageUrl);
  }

  return (
    <div className="page-active" id="page-hotel">
      <div
        className="container"
        style={{ paddingTop: '2rem', paddingBottom: '4rem' }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate('/search')}
          style={{ marginBottom: '1.5rem' }}
        >
          ← Back to Hotels 
        </button>

        <div id="hotel-detail-content">
          <div className="fade-in">
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                marginBottom: '2rem',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div
                  className="gallery-main"
                  style={{
                    background: hotel.color,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    id="gallery-main-img"
                    src={selectedImage || hotel.imageUrl}
                    alt={hotel.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>

                <div className="gallery-thumbs">
                  {galleryImages.map((img, index) => (
                    <div
                      key={`${img.value}-${index}`}
                      className={`gallery-thumb${
                        selectedImage === img.value ? ' active' : ''
                      }`}
                      style={{
                        background: hotel.color,
                        opacity: selectedImage === img.value ? 1 : 0.7,
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                      onClick={() => selectThumb(img.value)}
                      title={img.label}
                    >
                      <img
                        src={img.value}
                        alt={img.label}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '280px' }}>
                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    marginBottom: '1rem',
                  }}
                >
                  <span className="badge badge-gold">
                    {'⭐'.repeat(hotel.stars || 0)}
                  </span>

                  <span className="badge badge-emerald">
                    ✓ Verified
                  </span>
                </div>

                <h1
                  className="amiri"
                  style={{
                    fontSize: '2rem',
                    color: 'var(--navy)',
                    marginBottom: '6px',
                  }}
                >
                  {hotel.name}
                </h1>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem',
                    fontSize: '14px',
                    flexWrap: 'wrap',
                  }}
                >
                  📍 {hotel.city}
                  <span>&nbsp;|&nbsp;</span>
                  ⭐ {hotel.rating} ({hotel.reviews} reviews)
                </div>

                <p
                  style={{
                    color: 'var(--text-mid)',
                    lineHeight: '1.9',
                    marginBottom: '1.5rem',
                  }}
                >
                  {hotel.description}
                </p>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: 'var(--navy)',
                      marginBottom: '10px',
                      fontSize: '14px',
                    }}
                  >
                    ✦ Amenities
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    {(hotel.amenities || []).map((amenity) => (
                      <div className="amenity" key={amenity}>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

               
              </div>
            </div>

            <div>
              <h2
                className="amiri"
                style={{
                  color: 'var(--navy)',
                  fontSize: '1.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                ✦ Available Room Types
              </h2>

              {roomTypes.length > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {roomTypes.map((room) => (
                    <div
                      key={room.id}
                      className="room-card"
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'stretch',
                        flexWrap: 'wrap',
                        border: '1px solid var(--border)',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                    >
                      <div
                        style={{
                          width: '240px',
                          minHeight: '170px',
                          background: hotel.color,
                          flexShrink: 0,
                        }}
                      >
                        {room.imageUrl ? (
                          <img
                            src={room.imageUrl}
                            alt={room.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
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
                            🛏
                          </div>
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          minWidth: '240px',
                          padding: '1rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '1rem',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <h3
                            className="amiri"
                            style={{
                              color: 'var(--navy)',
                              fontSize: '1.25rem',
                              marginBottom: '0.4rem',
                            }}
                          >
                            {room.name}
                          </h3>

                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-muted)',
                              marginBottom: '6px',
                            }}
                          >
                            🏨 {room.hotelName}
                          </div>

                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-muted)',
                              marginBottom: '6px',
                            }}
                          >
                            👥 Capacity: {room.capacity} guests
                          </div>

                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-muted)',
                              marginBottom: '6px',
                            }}
                          >
                            🛏 Total Rooms: {room.totalRooms}
                          </div>

                          <div
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-mid)',
                              marginTop: '0.5rem',
                            }}
                          >
                            {room.amenities}
                          </div>
                        </div>

                        <div
                          style={{
                            minWidth: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'flex-end',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              color: 'var(--emerald)',
                              fontSize: '1.3rem',
                            }}
                          >
                            ${room.basePrice}
                            <span
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-muted)',
                                fontWeight: 400,
                              }}
                            >
                              {' '}
                              / night
                            </span>
                          </div>

                          <button
                            className="btn btn-primary btn-sm"
                            style={{ marginTop: '1rem' }}
                            onClick={()=>BookRoom(room)}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🛏</div>
                  <div>No room types available for this hotel</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}