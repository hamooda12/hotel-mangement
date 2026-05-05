import { Home } from './Pages/Home';
import { Layout } from './Pages/Layout';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Hotels } from './Pages/Hotels';
import { HotelDetails } from './Pages/HotelDetails';
import { Contact } from './Pages/SupportPages/Contact';
import { FAQ } from './Pages/SupportPages/FAQ';
import { Privacy } from './Pages/SupportPages/Privacy';
import { TermsOfService } from './Pages/SupportPages/TermsOfService';
import BookingPage from './Pages/Booking';
import { MyBookings } from './Pages/MyBookings';
import { Admin } from "./Pages/Admin";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="search" element={<Hotels />} />
          <Route path="hotel/:id" element={<HotelDetails />} />
     <Route path="booking" element={<BookingPage />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<TermsOfService />} />
           <Route path="my-bookings" element={<MyBookings />} />
           <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;