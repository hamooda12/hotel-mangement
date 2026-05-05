import { useNavigate } from "react-router-dom";
import  { showToast } from  '../FunctionsofTheProject/HelperFunctions.js'
import {getHotels} from '../api/hotelApi.js'
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
    function hotelCardHTML(h) {
    return <div className="hotel-card" onClick={() => viewHotel(h.id)}>
    <div className="hotel-img" style={{ background: h.color }}>
      <img src={h.imageUrl}></img>
      <div className="hotel-img-badge"><span className="badge badge-gold">{ '⭐'.repeat(h.stars) }</span></div>
    </div>
    <div className="hotel-card-body">
      <div className="hotel-name">{h.name}</div>
      <div className="hotel-location">📍 {h.city}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>{h.amenities.slice(0, 3).map(a => <span style={{ fontSize: '11px', background: 'var(--emerald-xlight)', color: 'var(--emerald)', padding: '3px 8px', borderRadius: '20px' }}>{a}</span>)}</div>
      <div className="hotel-footer">
        <div><div className="stars">{ '⭐'.repeat(Math.floor(h.rating)) }</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.rating} ({h.reviews} reviews)</div></div>
        <div className="price-tag">${h.minPrice}<span>/night</span></div>
      </div>
    </div>
  </div>;
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
function doHomeSearch() { const c = document.getElementById('home-city').value; if (c) document.getElementById('f-city').value = c; navigate('search'); }
  return  (<div className="page active" id="page-home">
 
    <div className="hero geo-bg">
      <div className="hero-content fade-in">
        <div className="hero-eyebrow"><div className="hero-eyebrow-line"></div><span>Luxury Redefined</span></div>
        <h1>Where Elegance<br/>Meets <span>Tradition</span></h1>
        <p>Experience world-class hospitality inspired by the golden age of Islamic architecture. Discover curated hotels across the finest destinations.</p>
      <div className="hero-actions">
        <button className="btn btn-gold btn-lg" onClick={() => navigate('search')}>✦ Discover Hotels</button>
        <button className="btn btn-lg" style={{ border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff', background: 'transparent' }} onClick={() => navigate('about')}>Learn More</button>
      </div>
      <div className="hero-stats">
        <div style={{ textAlign: 'center' }}><span className="stat-num">48+</span><span className="stat-label">Luxury Hotels</span></div>
        <div style={{ textAlign: 'center' }}><span className="stat-num">12</span><span className="stat-label">Countries</span></div>
        <div style={{ textAlign: 'center' }}><span className="stat-num">98%</span><span className="stat-label">Satisfaction</span></div>
      </div>
    </div>
     
  </div>

  <div className="container" style={{ position: 'relative', zIndex: 2, marginTop: '-30px' }}>
    <div className="search-widget">
      <h3 style={{ fontFamily: "'Amiri',serif", color: 'var(--navy)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>✦ Search Available Hotels</h3>
      <div className="search-grid">
        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Destination</label>
          <select className="form-input" id="home-city"><option value="">Select city...</option><option>Dubai, UAE</option><option>Istanbul, Turkey</option><option>Mecca, Saudi Arabia</option><option>Marrakech, Morocco</option><option>Cairo, Egypt</option><option>Abu Dhabi, UAE</option></select>
        </div>
        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Check-in</label><input type="date" className="form-input" id="home-checkin"/></div>
        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Check-out</label><input type="date" className="form-input" id="home-checkout"/></div>
        <div className="form-group" style={{ margin: 0 }}><label className="form-label">Guests</label>
          <select className="form-input" id="home-guests"><option>1</option><option defaultValue={"2"}>2</option><option>3</option><option>4</option><option>5+</option></select>
        </div>
        <button className="btn btn-primary" style={{ height: '42px', whiteSpace: 'nowrap' }} onClick={doHomeSearch}>Search →</button>
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
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}><button className="btn btn-outline" onClick={() => navigate('search')}>View All Hotels →</button></div>
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

  <section className="section" style={{ background: 'var(--bg-mid)' }}>
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
          <div className="footer-brand">Al-<span>Qasr</span> Hotels</div>
          <p style={{ fontSize: '13px', lineHeight: '1.8', maxWidth: '280px', marginBottom: '1rem' }}>Luxury inspired by the timeless beauty of Islamic civilization. Your palace awaits across 12 countries.</p>
          <div className="badge badge-gold">Est. 1995 · Dubai, UAE</div>
        </div>
        <div>
          <div className="footer-heading">Explore</div>
          <button className="footer-link" onClick={() => navigate('home')}>Home</button>
          <button className="footer-link" onClick={() => navigate('search')}>Hotels</button>
          <button className="footer-link" onClick={() => navigate('my-bookings')}>My Bookings</button>
          <button className="footer-link" onClick={scrollToAbout}>About Us</button>
        </div>
        <div>
          <div className="footer-heading">Support</div>
          <button className="footer-link" onClick={() => showToast('Contact: +971-4-000-0000','info')}>Contact Us</button>
          <button className="footer-link" onClick={() => showToast('FAQ page coming soon','info')}>FAQ</button>
          <button className="footer-link" onClick={() => showToast('Privacy policy','info')}>Privacy Policy</button>
          <button className="footer-link" onClick={() => showToast('Terms of service','info')}>Terms of Service</button>
        </div>
      </div>
      <div className="footer-bottom">© 2024 Al-Qasr Hotels Group. All rights reserved.</div>
    </div>
  </footer>
   
</div>) }