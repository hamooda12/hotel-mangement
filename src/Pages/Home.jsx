import { useNavigate } from "react-router-dom";
import  { showToast } from  '../FunctionsofTheProject/HelperFunctions.js'
import { Header } from "./Header.jsx";
import '../commonStyle.css'
import '../FunctionsofTheProject/toast.css'
import '../PagesStyles/home.css'
export function Home() {
    function hotelCardHTML(h) {
    return <div className="hotel-card" onClick={() => viewHotel(h.id)}>
    <div className="hotel-img" style={{ background: h.color }}>
      <span style={{ fontSize: '3rem' }}>{h.img}</span>
      <div className="hotel-img-badge"><span className="badge badge-gold">{ '⭐'.repeat(h.stars) }</span></div>
    </div>
    <div className="hotel-card-body">
      <div className="hotel-name">{h.name}</div>
      <div className="hotel-location">📍 {h.city}</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>{h.amenities.slice(0, 3).map(a => <span style={{ fontSize: '11px', background: 'var(--emerald-xlight)', color: 'var(--emerald)', padding: '3px 8px', borderRadius: '20px' }}>{a}</span>)}</div>
      <div className="hotel-footer">
        <div><div className="stars">{ '⭐'.repeat(Math.floor(h.rating)) }</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.rating} ({h.reviews} reviews)</div></div>
        <div className="price-tag">${h.price}<span>/night</span></div>
      </div>
    </div>
  </div>;
}
function teamCardHTML(m) {
    return <div className="team-card">
      <div className="team-avatar" style={{ background: m.color }}>{m.emoji}</div>
      <div style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem', color: 'var(--navy)', marginBottom: '4px' }}>{m.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.role}</div>
    </div>
}
const HOTELS = [
    { id: 1, name: 'Burj Al-Qasr Palace', city: 'Dubai, UAE', stars: 5, rating: 4.9, reviews: 842, price: 380, img: '🏙', color: 'linear-gradient(135deg,#0f2a1e,#065f46)', amenities: ['🏊 Pool', '💪 Gym', '🛕 Prayer Room', '🍽 Restaurant', '🅿 Parking', '🌿 Spa'], desc: 'An iconic tower rising above Dubai Marina, offering panoramic views of the Gulf and city skyline. Inspired by the latticed towers of ancient Mecca.', rooms: [{ id: 1, name: 'Standard Room', capacity: 2, price: 380, emoji: '🛏' }, { id: 2, name: 'Deluxe Suite', capacity: 3, price: 580, emoji: '🏡' }, { id: 3, name: 'Royal Penthouse', capacity: 6, price: 1200, emoji: '👑' }] },
    { id: 2, name: 'Topkapi Residence', city: 'Istanbul, Turkey', stars: 5, rating: 4.8, reviews: 621, price: 290, img: '🕌', color: 'linear-gradient(135deg,#1a0533,#4c1d95)', amenities: ['🌊 Bosphorus View', '🛕 Prayer Room', '🍽 Ottoman Cuisine', '💆 Hammam'], desc: 'Perched above the Bosphorus, this historic property blends Ottoman grandeur with contemporary comfort. Intricate Iznik tilework adorns every corridor.', rooms: [{ id: 1, name: 'Bosphorus View Room', capacity: 2, price: 290, emoji: '🌊' }, { id: 2, name: 'Ottoman Suite', capacity: 4, price: 520, emoji: '🏛' }] },
    { id: 3, name: 'Al-Madinah Grand', city: 'Mecca, Saudi Arabia', stars: 5, rating: 4.9, reviews: 1240, price: 450, img: '🕋', color: 'linear-gradient(135deg,#7c2d12,#c2410c)', amenities: ['🕋 Masjid View', '🛕 Prayer Halls', '🍽 Halal Only', '🚌 Shuttle'], desc: 'The closest luxury hotel to Al-Masjid Al-Haram, offering breathtaking views of the Kaaba from premium suites.', rooms: [{ id: 1, name: 'Haramain View Room', capacity: 2, price: 450, emoji: '🕋' }, { id: 2, name: 'Zam Zam Suite', capacity: 4, price: 850, emoji: '✨' }] },
    { id: 4, name: 'Riad Al-Andalus', city: 'Marrakech, Morocco', stars: 4, rating: 4.7, reviews: 389, price: 195, img: '🌺', color: 'linear-gradient(135deg,#7c3aed,#c026d3)', amenities: ['🌿 Courtyard', '🛁 Hammam', '🍽 Moroccan Cuisine', '🎭 Cultural Tours'], desc: 'A traditional riad hidden behind ancient medina walls, with a lush central courtyard and handcrafted zellij tilework.', rooms: [{ id: 1, name: 'Courtyard Room', capacity: 2, price: 195, emoji: '🌸' }, { id: 2, name: 'Terrace Suite', capacity: 3, price: 320, emoji: '🌅' }] },
    { id: 5, name: "Pharaoh's Nile Palace", city: 'Cairo, Egypt', stars: 5, rating: 4.6, reviews: 512, price: 220, img: '🏛', color: 'linear-gradient(135deg,#78350f,#b45309)', amenities: ['🌊 Nile View', '🏛 Ancient Art', '🍽 Restaurant', '🏊 Pool'], desc: "Sitting on the Nile corniche with unobstructed views of the pyramids at sunset. Hieroglyphic motifs blend with Islamic geometrics.", rooms: [{ id: 1, name: 'Nile View Room', capacity: 2, price: 220, emoji: '🌊' }, { id: 2, name: 'Pharaoh Suite', capacity: 4, price: 420, emoji: '👑' }] },
    { id: 6, name: 'Emirates Heritage Resort', city: 'Abu Dhabi, UAE', stars: 5, rating: 4.8, reviews: 734, price: 520, img: '🌴', color: 'linear-gradient(135deg,#0369a1,#0f766e)', amenities: ['🏖 Private Beach', '🏊 Infinity Pool', '🛕 Mosque', '🍽 7 Restaurants'], desc: 'A sweeping beachfront resort celebrating Emirati heritage, inspired by traditional wind tower architecture.', rooms: [{ id: 1, name: 'Garden Room', capacity: 2, price: 520, emoji: '🌿' }, { id: 2, name: 'Beach Suite', capacity: 4, price: 880, emoji: '🏖' }, { id: 3, name: 'Presidential Villa', capacity: 8, price: 2500, emoji: '🏰' }] },
];
const TEAM = [
    { name: 'Sheikh Omar Al-Rashid', role: 'Founder & Chairman', color: '#065f46', emoji: '👨‍💼' },
    { name: 'Fatima Al-Zahra', role: 'CEO', color: '#7c2d12', emoji: '👩‍💼' },
    { name: 'Dr. Yusuf Mansour', role: 'Head of Architecture', color: '#1e40af', emoji: '👨‍🎨' },
    { name: 'Amina Khalil', role: 'Guest Experience', color: '#6d28d9', emoji: '👩‍✈️' },
];
  const navigate = useNavigate();
  function scrollToAbout() { navigate('home'); setTimeout(() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' }), 100); }
function doHomeSearch() { const c = document.getElementById('home-city').value; if (c) document.getElementById('f-city').value = c; navigate('search'); }
  return  (<div className="page active" id="page-home">
 
    <div className="hero geo-bg">
      <div className="hero-content fade-in">
        <div className="hero-eyebrow"><div className="hero-eyebrow-line"></div><span>Luxury Redefined</span></div>
        <h1>Where Elegance<br/>Meets <span>Tradition</span></h1>
        <p>Experience world-className hospitality inspired by the golden age of Islamic architecture. Discover curated hotels across the finest destinations.</p>
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
          <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>A Legacy of<br/>Timeless Hospitality</h2>
          <p style={{ color: 'var(--text-mid)', lineHeight: '1.9', marginBottom: '1rem' }}>Al-Qasr Hotels was founded with a vision to blend the rich heritage of Islamic architecture with modern luxury. Our name — meaning "The Palace" in Arabic — reflects our commitment to regal experiences.</p>
          <p style={{ color: 'var(--text-mid)', lineHeight: '1.9', marginBottom: '2rem' }}>From the intricate geometric patterns adorning our lobbies to the serene courtyards inspired by Andalusian riads, every element honors the golden age of Islamic civilization.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="amenity">🕌 Islamic Architecture</div><div className="amenity">⭐ 5-Star Service</div>
            <div className="amenity">🌿 Halal Dining</div><div className="amenity">🛕 Prayer Facilities</div>
          </div>
        </div>
        <div className="about-img-box">🕌</div>
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
        <button className="social-btn" onClick={() => showToast('Instagram','info')}>📷</button>
        <button className="social-btn" onClick={() => showToast('Twitter','info')}>🐦</button>
        <button className="social-btn" onClick={() => showToast('LinkedIn','info')}>💼</button>
        <button className="social-btn" onClick={() => showToast('YouTube','info')}>▶</button>
        <button className="social-btn" onClick={() => showToast('WhatsApp','info')}>💬</button>
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