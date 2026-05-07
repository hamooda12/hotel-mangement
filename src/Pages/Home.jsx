import { useNavigate } from "react-router-dom";
import { showToast } from "../FunctionsofTheProject/HelperFunctions.js";
import { getHotels, getRoomTypes } from "../api/hotelApi.js";
import HamoodaImg from "../assets/team/Hamooda.png";
import HamadImg from "../assets/team/Hamad.png";
import SaeedImg from "../assets/team/Saeed.png";
import {
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";
import "../commonStyle.css";
import "../FunctionsofTheProject/toast.css";
import "../PagesStyles/home.css";
import "../assets/hotelBackground.png";
import { useEffect, useMemo, useState } from "react";

export function Home() {
  const navigate = useNavigate();

  const [HOTELS, setHotels] = useState([]);
  const [ROOM_TYPES, setRoomTypes] = useState([]);

  const [stats, setStats] = useState({
    hotelsCount: 0,
    citiesCount: 0,
    roomTypesCount: 0,
  });

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [hotelsResponse, roomsResponse] = await Promise.all([
          getHotels(),
          getRoomTypes({
            page: 0,
            size: 100,
            sort: "id,desc",
          }),
        ]);

        const hotels = extractList(hotelsResponse);
        const roomTypes = extractList(roomsResponse);

        setHotels(hotels);
        setRoomTypes(roomTypes);

        const uniqueCities = new Set(
          hotels.map((hotel) => hotel.city).filter(Boolean)
        );

        setStats({
          hotelsCount: hotels.length,
          citiesCount: uniqueCities.size,
          roomTypesCount: roomTypes.length,
        });
      } catch (error) {
        console.error("Error loading home data:", error);
        showToast?.("Failed to load home data", "error");
      }
    }

    loadHomeData();
  }, []);

  function extractList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  }

  function getHotelRoomTypes(hotel) {
    return hotel.roomTypes || hotel.rooms || hotel.roomTypeList || [];
  }

  function getRoomName(room) {
    return room.name || room.typeName || room.roomTypeName || "";
  }

  function getRoomCapacity(room) {
    return Number(room.capacity || room.maxGuests || room.guests || 0);
  }

  const cityOptions = useMemo(() => {
    return [...new Set(HOTELS.map((hotel) => hotel.city).filter(Boolean))].sort();
  }, [HOTELS]);

  const roomTypeOptions = useMemo(() => {
    const fromHotels = HOTELS.flatMap((hotel) => getHotelRoomTypes(hotel))
      .map((room) => getRoomName(room))
      .filter(Boolean);

    const fromRoomTypes = ROOM_TYPES.map((room) => getRoomName(room)).filter(
      Boolean
    );

    return [...new Set([...fromHotels, ...fromRoomTypes])].sort();
  }, [HOTELS, ROOM_TYPES]);

  const maxGuests = useMemo(() => {
    const fromHotels = HOTELS.flatMap((hotel) => getHotelRoomTypes(hotel))
      .map((room) => getRoomCapacity(room))
      .filter((capacity) => capacity > 0);

    const fromRoomTypes = ROOM_TYPES.map((room) => getRoomCapacity(room)).filter(
      (capacity) => capacity > 0
    );

    const capacities = [...fromHotels, ...fromRoomTypes];

    if (capacities.length === 0) return 1;

    return Math.max(...capacities);
  }, [HOTELS, ROOM_TYPES]);

  const guestOptions = useMemo(() => {
    return Array.from({ length: maxGuests }, (_, index) => index + 1);
  }, [maxGuests]);

  const TEAM = [
    {
      name: "Hamad Tarawa",
      role: "Project Lead & Full Stack Developer",
      image: HamadImg,
    },
    {
      name: "Mohammad Tawayha",
      role: "Spring Boot & Database Developer",
      image: HamoodaImg,
    },
    {
      name: "Saeed Awad",
      role: "React UI Developer",
      image: SaeedImg,
    },
  ];

  const featuredHotels = useMemo(() => HOTELS.slice(0, 3), [HOTELS]);
  const heroHotel = featuredHotels[0] || HOTELS[0];
  const secondaryHotel = featuredHotels[1] || HOTELS[1] || heroHotel;
  const thirdHotel = featuredHotels[2] || HOTELS[2] || secondaryHotel;

  function viewHotel(id) {
    navigate(`/hotel/${id}`);
  }

  function doHomeSearch() {
    const city = document.getElementById("home-city")?.value || "";
    const roomType = document.getElementById("home-room-type")?.value || "";
    const guests = document.getElementById("home-guests")?.value || "";

    const params = new URLSearchParams();

    if (city) params.append("city", city);
    if (roomType) params.append("roomType", roomType);
    if (guests) params.append("guests", guests);

    navigate(`/search?${params.toString()}`);
  }

  function hotelCardHTML(h, index = 0) {
    const amenities = Array.isArray(h.amenities) ? h.amenities : [];

    return (
      <article
        className={`home-hotel-card home-hotel-card-${index + 1}`}
        onClick={() => viewHotel(h.id)}
        key={h.id}
      >
        <div className="home-hotel-media" style={{ background: h.color }}>
          {h.imageUrl ? <img src={h.imageUrl} alt={h.name} /> : <span>🏨</span>}

          <div className="home-hotel-media-shade" />
          <div className="home-hotel-floating-rating">
            <strong>{Number(h.rating || 0).toFixed(1)}</strong>
            <span>{h.reviews || 0} reviews</span>
          </div>
          <div className="home-hotel-stars">
            {"⭐".repeat(Number(h.stars || 0))}
          </div>
        </div>

        <div className="home-hotel-content">
          <div>
            <div className="home-hotel-location">📍 {h.city || "Premium destination"}</div>
            <h3>{h.name}</h3>
          </div>

          <div className="home-hotel-amenities">
            {amenities.slice(0, 3).map((a) => (
              <span key={a}>{a}</span>
            ))}
            {amenities.length === 0 && (
              <>
                <span>Free WiFi</span>
                <span>Comfort Stay</span>
                <span>Verified</span>
              </>
            )}
          </div>

          <div className="home-hotel-bottom-row">
            <div>
              <span className="home-price-label">Starting from</span>
              <strong>${Number(h.minPrice || 0).toLocaleString()}</strong>
            </div>
            <button className="home-card-link" type="button">
              View rooms →
            </button>
          </div>
        </div>
      </article>
    );
  }

  function teamCardHTML(m, index) {
    return (
      <article className="home-team-card" key={m.name}>
        <div className="home-team-number">0{index + 1}</div>
        <div className="home-team-avatar">
          <img src={m.image} alt={m.name} />
        </div>
        <div className="home-team-info">
          <h3>{m.name}</h3>
          <p>{m.role}</p>
        </div>
      </article>
    );
  }

  return (
    <div className="page active home-page" id="page-home">
      <section className="home-hero">
        <div className="home-hero-background" />
        <div className="home-hero-glow home-hero-glow-one" />
        <div className="home-hero-glow home-hero-glow-two" />

        <div className="home-hero-shell">
          <div className="home-hero-copy fade-in">
            <div className="home-kicker">
              <span></span>
              Luxury hotel booking experience
            </div>

            <h1>
              Where every stay feels <span>handpicked</span> for you.
            </h1>

            <p>
              Discover selected hotels, compare rooms with confidence, and book a
              stay that feels premium from the first click to the final
              confirmation.
            </p>

            <div className="home-hero-actions">
              <button
                className="btn btn-gold btn-lg"
                onClick={() => navigate("/search")}
              >
                Explore Hotels →
              </button>

              <button
                className="home-ghost-button"
                onClick={() => {
                  document.getElementById("featured-hotels-section")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }}
              >
                See featured stays
              </button>
            </div>

            <div className="home-hero-trust-row">
              <div>
                <strong>Verified stays</strong>
                <span>Real hotels, rooms, prices and amenities</span>
              </div>
              <div>
                <strong>Fast checkout</strong>
                <span>Simple booking flow with reservation tracking</span>
              </div>
            </div>
          </div>

          <div className="home-hero-showcase fade-in">
            <div
              className="home-showcase-main"
              onClick={() => heroHotel?.id && viewHotel(heroHotel.id)}
            >
              {heroHotel?.imageUrl ? (
                <img src={heroHotel.imageUrl} alt={heroHotel.name} />
              ) : (
                <div className="home-showcase-placeholder">🏨</div>
              )}
              <div className="home-showcase-overlay">
                <span>Featured property</span>
                <h2>{heroHotel?.name || "Premium Hotel Collection"}</h2>
                <p>{heroHotel?.city || "Discover your next luxury stay"}</p>
              </div>
            </div>

            <div className="home-showcase-stack">
              <div
                className="home-showcase-mini"
                onClick={() => secondaryHotel?.id && viewHotel(secondaryHotel.id)}
              >
                {secondaryHotel?.imageUrl ? (
                  <img src={secondaryHotel.imageUrl} alt={secondaryHotel.name} />
                ) : (
                  <span>🌴</span>
                )}
                <div>
                  <strong>{secondaryHotel?.name || "Curated rooms"}</strong>
                  <small>{secondaryHotel?.city || "Comfort meets style"}</small>
                </div>
              </div>

              <div
                className="home-showcase-mini home-showcase-mini-dark"
                onClick={() => thirdHotel?.id && viewHotel(thirdHotel.id)}
              >
                {thirdHotel?.imageUrl ? (
                  <img src={thirdHotel.imageUrl} alt={thirdHotel.name} />
                ) : (
                  <span>🛎</span>
                )}
                <div>
                  <strong>{thirdHotel?.name || "Exclusive offers"}</strong>
                  <small>{thirdHotel?.city || "Find your best match"}</small>
                </div>
              </div>
            </div>

            <div className="home-floating-review">
              <span>Guest confidence</span>
              <strong>4.8/5</strong>
              <small>Average premium stay experience</small>
            </div>
          </div>
        </div>

        <div className="home-search-dock">
          <div className="home-search-heading">
            <span>Start your journey</span>
            <strong>Find your ideal stay</strong>
          </div>

          <div className="home-search-grid">
            <div className="home-search-field">
              <label>Destination</label>
              <select id="home-city">
                <option value="">All Destinations</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="home-search-field">
              <label>Room Type</label>
              <select id="home-room-type">
                <option value="">All Room Types</option>
                {roomTypeOptions.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ))}
              </select>
            </div>

            <div className="home-search-field">
              <label>Guests</label>
              <select id="home-guests">
                <option value="">Any Guests</option>
                {guestOptions.map((guest) => (
                  <option key={guest} value={guest}>
                    {guest} {guest === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>

            <button className="home-search-button" onClick={doHomeSearch}>
              Search stays
            </button>
          </div>
        </div>
      </section>

      <section className="home-stats-strip">
        <div className="container home-stats-grid">
          <div className="home-stat-card">
            <span>{stats.hotelsCount}</span>
            <strong>Selected Hotels</strong>
            <p>Carefully prepared stays across the platform.</p>
          </div>
          <div className="home-stat-card">
            <span>{stats.citiesCount}</span>
            <strong>Cities Covered</strong>
            <p>Explore stays across different destinations.</p>
          </div>
          <div className="home-stat-card">
            <span>{stats.roomTypesCount}+</span>
            <strong>Room Types</strong>
            <p>Choose rooms that match your trip and guests.</p>
          </div>
        </div>
      </section>

      <section className="home-featured-section" id="featured-hotels-section">
        <div className="container">
          <div className="home-section-header">
            <span>Featured destinations</span>
            <h2>Hotels that make the first impression unforgettable.</h2>
            <p>
              A polished collection of stays with images, amenities, rooms and
              booking flow designed to feel real and trustworthy.
            </p>
          </div>

          <div className="home-hotels-grid" id="featured-hotels">
            {featuredHotels.length > 0 ? (
              featuredHotels.map((h, index) => hotelCardHTML(h, index))
            ) : (
              <div className="home-empty-panel">
                <div>🏨</div>
                <strong>No hotels loaded yet</strong>
                <p>Add hotels from the admin dashboard to feature them here.</p>
              </div>
            )}
          </div>

          <div className="home-center-actions">
            <button className="btn btn-outline" onClick={() => navigate("/search")}>
              View all hotels →
            </button>
          </div>
        </div>
      </section>

      <section className="home-experience-section" id="about-section">
        <div className="container home-experience-grid">
          <div className="home-experience-copy">
            <span className="home-section-kicker">The experience</span>
            <h2>Designed like a real booking platform, built with care.</h2>
            <p>
              AlQasr brings the feeling of browsing a premium hotel marketplace:
              bold visuals, clear hotel details, room cards, booking steps,
              reservation tracking, and an admin dashboard that keeps the system
              organized.
            </p>

            <div className="home-experience-list">
              <div>✓ Real hotel discovery and filtering</div>
              <div>✓ Room-based booking flow</div>
              <div>✓ Reservation history and admin control</div>
              <div>✓ Premium visual identity</div>
            </div>
          </div>

          <div className="home-experience-visual">
            <div className="home-visual-card home-visual-card-main">
              <span>Luxury preview</span>
              <strong>{heroHotel?.name || "AlQasr Collection"}</strong>
              <p>{heroHotel?.description || "Find comfort, trust, and elegant stays in one place."}</p>
            </div>
            <div className="home-visual-card home-visual-card-float">
              <strong>Instant booking</strong>
              <span>Rooms • Guests • Payment • Confirmation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-team-section" id="about">
        <div className="container">
          <div className="home-section-header home-team-header">
            <span>Behind the platform</span>
            <h2>The team shaping the AlQasr experience.</h2>
            <p>
              Three focused builders bringing together backend logic, frontend
              experience, and polished product design.
            </p>
          </div>

          <div className="home-team-grid" id="team-grid">
            {TEAM.map((m, index) => teamCardHTML(m, index))}
          </div>

          <div className="social-links home-social-links">
            <a
              className="social-btn instagram"
              href="https://www.instagram.com/sa3ed.mo.awad/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>

            <a
              className="social-btn twitter"
              href="https://x.com/Saaed_Awad_"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X / Twitter"
            >
              <FaXTwitter />
            </a>

            <a
              className="social-btn linkedin"
              href="https://www.linkedin.com/in/saeed-awad-93b99826a/?locale=en"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>

            <a
              className="social-btn youtube"
              href="https://www.youtube.com/@saeedawad8426"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>

            <a
              className="social-btn whatsapp"
              href="https://wa.me/970593818026"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <FaWhatsapp />
            </a>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand">
                Al<span>Qasr</span>
              </div>

              <p
                style={{
                  fontSize: "13px",
                  lineHeight: "1.8",
                  maxWidth: "280px",
                  marginBottom: "1rem",
                }}
              >
                A simple hotel booking platform for discovering selected hotels
                across multiple cities and countries with real room types,
                amenities, and trusted hotel details.
              </p>

              <div className="badge badge-gold">
                Hotels Across Multiple Destinations
              </div>
            </div>

            <div>
              <div className="footer-heading">Explore</div>

              <button className="footer-link" onClick={() => navigate("/home")}>
                Home
              </button>

              <button className="footer-link" onClick={() => navigate("/search")}>
                Hotels
              </button>

              <button
                className="footer-link"
                onClick={() => navigate("/my-bookings")}
              >
                My Bookings
              </button>

              <button
                className="footer-link"
                onClick={() => {
                  navigate("/home");

                  setTimeout(() => {
                    document.getElementById("about")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }, 100);
                }}
              >
                About Us
              </button>
            </div>

            <div>
              <div className="footer-heading">Support</div>

              <button
                className="footer-link"
                type="button"
                onClick={() => navigate("/contact")}
              >
                Contact Us
              </button>

              <button
                className="footer-link"
                type="button"
                onClick={() => navigate("/faq")}
              >
                FAQ
              </button>

              <button
                className="footer-link"
                type="button"
                onClick={() => navigate("/privacy")}
              >
                Privacy Policy
              </button>

              <button
                className="footer-link"
                type="button"
                onClick={() => navigate("/terms")}
              >
                Terms of Service
              </button>
            </div>
          </div>

          <div className="footer-bottom">
            © 2026 StayFinder Hotels. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
