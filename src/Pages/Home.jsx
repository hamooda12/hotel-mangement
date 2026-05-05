import { useNavigate } from "react-router-dom";
import  { showToast } from  '../FunctionsofTheProject/HelperFunctions.js'
import {getHotels,getRoomTypes} from '../api/hotelApi.js'
import HamoodaImg from "../assets/ProfilePhotos/Hamooda.png";
import HamadImg from "../assets/ProfilePhotos/Hamad.png"
import SaeedImg from "../assets/ProfilePhotos/Saeed.png"
import {
  FaInstagram,
  FaXTwitter,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp
} from "react-icons/fa6";
import '../commonStyle.css'
import '../FunctionsofTheProject/toast.css'
import '../PagesStyles/home.css'
import hotelBg from '../assets/hotelBackground.png';
import { useEffect, useState } from "react";


export function Home() {
  const [stats, setStats] = useState({
  hotelsCount: 0,
  citiesCount: 0,
  roomTypesCount: 0,
});

useEffect(() => {
  async function loadHomeStats() {
    try {
      const hotelsResponse = await getHotels();
      const roomsResponse = await getRoomTypes({
        page: 0,
        size: 100,
        sort: "id,desc",
      });

      const hotels = hotelsResponse.content || hotelsResponse || [];
      const roomTypes = roomsResponse.content || roomsResponse || [];

      const uniqueCities = new Set(hotels.map((hotel) => hotel.city));

      setStats({
        hotelsCount: hotels.length,
        citiesCount: uniqueCities.size,
        roomTypesCount: roomTypes.length,
      });
    } catch (error) {
      console.error("Error loading home stats:", error);
    }
  }

  loadHomeStats();
}, []);
function viewHotel(id) {
  navigate(`/hotel/${id}`);
}
  function hotelCardHTML(h) {
  return (
    <div className="hotel-card" onClick={() => viewHotel(h.id)}>
      <div className="hotel-img" style={{ background: h.color }}>
        <img src={h.imageUrl} alt={h.name} />
        <div className="hotel-img-badge">
          <span className="badge badge-gold">{'⭐'.repeat(h.stars)}</span>
        </div>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-name">{h.name}</div>
        <div className="hotel-location">📍 {h.city}</div>

        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}
        >
          {h.amenities.slice(0, 3).map((a) => (
            <span
              key={a}
              style={{
                fontSize: '11px',
                background: 'var(--emerald-xlight)',
                color: 'var(--emerald)',
                padding: '3px 8px',
                borderRadius: '20px',
              }}
            >
              {a}
            </span>
          ))}
        </div>

        <div className="hotel-footer">
          <div className="rating-center">
            <div className="stars">{'⭐'.repeat(Math.floor(h.rating))}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {h.rating} ({h.reviews} reviews)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function teamCardHTML(m) {
  return (
    <div className="team-card">
      <div className="team-avatar">
        <img src={m.image} alt={m.name} />
      </div>

      <div
        style={{
          fontFamily: "'Amiri', serif",
          fontSize: '1.1rem',
          color: 'var(--navy)',
          marginBottom: '4px'
        }}
      >
        {m.name}
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        {m.role}
      </div>
    </div>
  );
}
let [HOTELS,setHotels]=useState([]);
useEffect(()=>{
getHotels()
      .then((e) => {
        console.log(e.content);
        setHotels(e.content);
      })
      .catch((error) => {
        console.error("Error fetching hotels:", error);
      });
},[])

const TEAM = [
  {
    name: 'Hamad Tarawa',
    role: 'Project Lead & Full Stack Developer',
    image: HamadImg
  },
  {
    name: 'Mohammad Tawayha',
    role: 'Spring Boot & Database Developer',
    image: HamoodaImg
  },
  {
    name: 'Saeed Awad',
    role: 'React UI Developer',
    image: SaeedImg
  }
];
  const navigate = useNavigate();
  function scrollToAbout() { navigate('home'); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }
function doHomeSearch() {
  const city = document.getElementById('home-city')?.value || '';
  const roomType = document.getElementById('home-room-type')?.value || '';
  const guests = document.getElementById('home-guests')?.value || '';

  const params = new URLSearchParams();

  if (city) params.append('city', city);
  if (roomType) params.append('roomType', roomType);
  if (guests) params.append('guests', guests);

  navigate(`/search?${params.toString()}`);
}
  return  (<div className="page active" id="page-home">
 
    <div className="hero geo-bg">
  <div className="hero-content fade-in">
    <div className="hero-eyebrow">
      <div className="hero-eyebrow-line"></div>
      <span>Authentic Stays</span>
    </div>

    <h1>
      Discover Comfort<br />
      Across <span>Palestine & Jordan</span>
    </h1>

    <p>
      Explore carefully selected hotels in Amman, Ramallah, Hebron, and Jerusalem.
      Find comfortable rooms, trusted amenities, and stays that match your trip.
    </p>

    <div className="hero-actions">
      <button
        className="btn btn-gold btn-lg"
        onClick={() => navigate('/search')}
      >
        ✦ Discover Hotels
      </button>

      <button
        className="btn btn-lg"
        style={{
          border: '1.5px solid rgba(255,255,255,0.4)',
          color: '#fff',
          background: 'transparent',
        }}
        onClick={() => navigate('/about')}
      >
        Learn More
      </button>
    </div>

   <div className="hero-stats">
  <div style={{ textAlign: "center" }}>
    <span className="stat-num">{stats.hotelsCount}</span>
    <span className="stat-label">Selected Hotels</span>
  </div>

  <div style={{ textAlign: "center" }}>
    <span className="stat-num">{stats.citiesCount}</span>
    <span className="stat-label">Cities</span>
  </div>

  <div style={{ textAlign: "center" }}>
    <span className="stat-num">{stats.roomTypesCount}+</span>
    <span className="stat-label">Room Types</span>
  </div>
</div>
  </div>
</div>

  <div
  className="container"
  style={{ position: 'relative', zIndex: 2, marginTop: '-30px' }}
>
  <div className="search-widget">
    <h3
      style={{
        fontFamily: "'Amiri',serif",
        color: 'var(--navy)',
        fontSize: '1.2rem',
        marginBottom: '1.25rem',
      }}
    >
      ✦ Search Available Hotels
    </h3>

    <div className="search-grid">
      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Destination</label>

        <select className="form-input" id="home-city">
          <option value="">All Destinations</option>
          <option value="Amman, Jordan">Amman, Jordan</option>
          <option value="Ramallah, Palestine">Ramallah, Palestine</option>
          <option value="Hebron, Palestine">Hebron, Palestine</option>
          <option value="Jerusalem">Jerusalem</option>
        </select>
      </div>

      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Room Type</label>

        <select className="form-input" id="home-room-type">
          <option value="">All Room Types</option>

          <option value="King Guest Room">King Guest Room</option>
          <option value="Executive King Room">Executive King Room</option>
          <option value="Two-Bedroom Suite with One King and Two Twin Beds">
            Two-Bedroom Suite with One King and Two Twin Beds
          </option>

          <option value="Premium King Room">Premium King Room</option>
          <option value="Premium Twin">Premium Twin</option>
          <option value="Family Room">Family Room</option>

          <option value="Double or Twin Room">Double or Twin Room</option>

          <option value="Standard Double Room">Standard Double Room</option>
          <option value="Standard Twin Room">Standard Twin Room</option>

          <option value="Triple Room with City View">Triple Room with City View</option>
          <option value="Twin Room with City View">Twin Room with City View</option>
          <option value="Family Two-Bedroom Suite with City View">
            Family Two-Bedroom Suite with City View
          </option>

          <option value="Superior Twin Room">Superior Twin Room</option>
          <option value="Standard King Room With Sofa Bed">
            Standard King Room With Sofa Bed
          </option>
          <option value="Superior Triple Room">Superior Triple Room</option>
          <option value="Junior King Suite With Sofa Bed">
            Junior King Suite With Sofa Bed
          </option>
          <option value="King Suite With Sofa Bed">King Suite With Sofa Bed</option>
        </select>
      </div>

      <div className="form-group" style={{ margin: 0 }}>
        <label className="form-label">Guests</label>

        <select className="form-input" id="home-guests">
          <option value="">Any Guests</option>
          <option value="1">1 Guest</option>
          <option value="2">2 Guests</option>
          <option value="3">3 Guests</option>
          <option value="4">4 Guests</option>
          <option value="5">5+ Guests</option>
        </select>
      </div>

      <button
        className="btn btn-primary"
        style={{ height: '42px', whiteSpace: 'nowrap' }}
        onClick={doHomeSearch}
      >
        Search →
      </button>
    </div>
  </div>
</div>

  <section className="section" style={{ background: 'var(--bg-mid)' }}>
    <div className="container">
      <div className="section-header">
        <div className="section-eyebrow">Featured Destinations</div>
        <h2 className="section-title">Exquisite Hotels Await</h2>
        <div className="section-divider"><div className="divider-line"></div><div className="divider-diamond"></div><div className="divider-line"></div></div>
      </div>
      <div className="hotels-grid" id="featured-hotels">{ HOTELS.slice(0, 3).map(h => hotelCardHTML(h))}</div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}><button className="btn btn-outline" onClick={() => navigate('/search')}>View All Hotels →</button></div>
    </div>
  </section>

  <section className="section geo-bg" id="about-section">
    <div className="container">
      <div className="about-grid">
        <div>
       <div className="section-eyebrow">Our Story</div>

<h2
  className="section-title"
  style={{ textAlign: 'left', marginBottom: '1.5rem' }}
>
  Saladin Boutique <br /> Hotel
</h2>

<p
  style={{
    color: 'var(--text-mid)',
    lineHeight: '1.9',
    marginBottom: '1rem'
  }}
>
  Nestled in the heart of Jerusalem’s Old City, Saladin Boutique Hotel offers
  a warm and intimate stay just a short walk from the Western Wall, Via Dolorosa,
  and some of the city’s most meaningful historic landmarks.
</p>

<p
  style={{
    color: 'var(--text-mid)',
    lineHeight: '1.9',
    marginBottom: '2rem'
  }}
>
  With only a small collection of comfortable rooms, our hotel blends local
  character, modern convenience, and genuine hospitality. Guests can enjoy
  complimentary Wi-Fi, relaxing shared spaces, on-site dining, and easy access
  to the timeless streets of Jerusalem.
</p>

<div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  }}
>
  <div className="amenity">📍 Old City Location</div>
  <div className="amenity">☕ Coffee Shop</div>
  <div className="amenity">🍽 Restaurant</div>
  <div className="amenity">🛏 Boutique Rooms</div>
</div>
        </div>
        <div className="about-img-box"></div>
      </div>
    </div>
  </section>

  <section className="section" id="about" style={{ background: 'var(--bg-mid)' }}>
    <div className="container">
      <div className="section-header">
        <div className="section-eyebrow">Our Team</div>
        <h2 className="section-title">Meet the Visionaries</h2>
        <div className="section-divider"><div className="divider-line"></div><div className="divider-diamond"></div><div className="divider-line"></div></div>
      </div>
      <div className="team-grid" id="team-grid">{TEAM.map(m => teamCardHTML(m))}</div>
     <div className="social-links">
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

<footer>
  <div className="container">
    <div className="footer-grid">
      <div>
        <div className="footer-brand">
          Al<span>Qasr</span>
        </div>

        <p
          style={{
            fontSize: '13px',
            lineHeight: '1.8',
            maxWidth: '280px',
            marginBottom: '1rem',
          }}
        >
          A simple hotel booking platform for discovering selected hotels
          across Palestine, Jordan, and Jerusalem with real room types,
          amenities, and trusted hotel details.
        </p>

        <div className="badge badge-gold">
          Hotels in Palestine · Jordan · Jerusalem
        </div>
      </div>

      <div>
        <div className="footer-heading">Explore</div>

        <button
          className="footer-link"
          onClick={() => navigate('/home')}
        >
          Home
        </button>

        <button
          className="footer-link"
          onClick={() => navigate('/search')}
        >
          Hotels
        </button>

        <button
          className="footer-link"
          onClick={() => navigate('/my-bookings')}
        >
          My Bookings
        </button>

       <button
  className="footer-link"
  onClick={() => {
    navigate('/home');

    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
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
    onClick={() => navigate('/contact')}
  >
    Contact Us
  </button>

  <button
    className="footer-link"
    type="button"
    onClick={() => navigate('/faq')}
  >
    FAQ
  </button>

  <button
    className="footer-link"
    type="button"
    onClick={() => navigate('/privacy')}
  >
    Privacy Policy
  </button>

  <button
    className="footer-link"
    type="button"
    onClick={() => navigate('/terms')}
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
   
</div>) }