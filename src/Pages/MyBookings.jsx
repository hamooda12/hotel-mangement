import { useEffect, useMemo, useState } from "react";
;
import { useNavigate } from "react-router-dom";
import {
  getGuestBookingHistory,
  getAllBookings,
  cancelBooking as cancelBookingApi,
} from "../api/hotelApi";
import "../PagesStyles/MyBookings.css";
import "../commonStyle.css";


export function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);
  const [error, setError] = useState("");
const navigate = useNavigate();
  const isLoggedIn = useMemo(() => {
    console.log(localStorage.getItem("accessToken"))
    return Boolean(localStorage.getItem("accessToken"));
  }, []);

  useEffect(() => {
 

    loadBookings();
  }, [isLoggedIn]);

  async function loadBookings() {
    try {
      setLoading(true);
      setError("");

    const token = localStorage.getItem("accessToken");
const payload = JSON.parse(atob(token.split(".")[1]));

let data;

if (payload.role === "ADMIN" || payload.role === "MANAGER") {
  data = await getAllBookings();
} else {
  data = await getGuestBookingHistory();
}

setBookings(Array.isArray(data) ? data : []);
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId) {
     console.log("Cancel booking id:", bookingId);
    const confirmed = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmed) return;

    try {
      setCancelingId(bookingId);

      const updatedBooking = await cancelBookingApi(bookingId);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );

      if (selectedBooking?.id === bookingId) {
        setSelectedBooking(updatedBooking);
      }
    } catch (err) {
  console.error("CANCEL ERROR:", err);
  console.error("STATUS:", err?.response?.status);
  console.error("BACKEND DATA:", err?.response?.data);

  const backendMessage =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.response?.data ||
    "Could not cancel this booking.";

  alert(backendMessage);

    }
    finally {
      setCancelingId(null);
    }
  }

  function calcNights(checkIn, checkOut) {
    if (!checkIn || !checkOut) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const diff = end - start;
    const nights = diff / (1000 * 60 * 60 * 24);

    return nights > 0 ? nights : 0;
  }

  function formatDate(date) {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatMoney(value) {
    if (value === null || value === undefined) return "$0";

    return `$${Number(value).toFixed(2)}`;
  }

  function getStatusClass(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "confirmed") return "badge-emerald";
    if (normalized === "pending") return "badge-gold";
    if (normalized === "cancelled" || normalized === "canceled") return "badge-danger";
    if (normalized === "completed") return "badge-navy";

    return "badge-navy";
  }

  function canCancelBooking(status) {
    const normalized = String(status || "").toLowerCase();

    return normalized !== "completed" && normalized !== "cancelled" && normalized !== "canceled";
  }

  if (loading) {
    return (
      <section className="my-bookings-page">
        <div className="my-bookings-container">
          <PageHeader />
          <div className="bookings-loading-card">
            <div className="booking-spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section className="my-bookings-page">
      <div className="my-bookings-container">
        <PageHeader />

        {error && (
          <div className="bookings-error">
            <span>⚠️</span>
            <p>{error}</p>
            <button className="btn btn-outline btn-sm" onClick={loadBookings}>
              Try Again
            </button>
          </div>
        )}

        {!error && bookings.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>No bookings found</h2>
            <p>You have not made any hotel reservations yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => {
                navigate('./search')
              }}
            >
              Browse Hotels
            </button>
          </div>
        )}

        {!error && bookings.length > 0 && (
          <div className="bookings-list">
            {bookings.map((booking) => {
              const nights = calcNights(booking.checkIn, booking.checkOut);

              return(<div className="booking-card" key={booking.id}>
  <div className="booking-hotel-image-wrap">
    <img
      className="booking-hotel-image"
      src={booking.hotelImageUrl || "/hotel-placeholder.jpg"}
      alt={booking.hotelName || "Hotel"}
      onError={(e) => {
        e.currentTarget.src = "/hotel-placeholder.jpg";
      }}
    />
  </div>

  <div className="booking-main-info">
    <h2>{booking.hotelName}</h2>

    <p className="booking-subtitle">
      📍 Hotel ID: {booking.hotelId} · {booking.roomTypeName}
    </p>

    <div className="booking-meta">
      <span>📅 {formatDate(booking.checkIn)}</span>
      <span>→</span>
      <span>{formatDate(booking.checkOut)}</span>
      <span>🌙 {nights} nights</span>
      <span>👥 {booking.guests} guests</span>
    </div>
  </div>

  <div className="booking-actions-box">
    <div className="booking-price">{formatMoney(booking.totalPrice)}</div>

    <span className={`badge ${getStatusClass(booking.status)}`}>
      {booking.status}
    </span>

    <div className="booking-buttons">
      <button
        className="btn btn-outline btn-sm"
        onClick={() => setSelectedBooking(booking)}
      >
        Details
      </button>

      {canCancelBooking(booking.status) && (
        <button
          className="btn btn-danger btn-sm"
          disabled={cancelingId === booking.id}
          onClick={() => handleCancelBooking(booking.id)}
        >
          {cancelingId === booking.id ? "Canceling..." : "Cancel"}
        </button>
      )}
    </div>
  </div>
</div>)
           
           
           })}
          </div>
        )}
      </div>

      {selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          formatDate={formatDate}
          formatMoney={formatMoney}
          calcNights={calcNights}
          getStatusClass={getStatusClass}
          canCancelBooking={canCancelBooking}
          cancelingId={cancelingId}
          onCancel={handleCancelBooking}
        />
      )}
    </section>
  );
}

function PageHeader() {
  return (
    <div className="my-bookings-header">
      <h1>My Bookings</h1>
      <p>Manage your reservations and review your hotel stays.</p>
    </div>
  );
}

function BookingDetailsModal({
  booking,
  onClose,
  formatDate,
  formatMoney,
  calcNights,
  getStatusClass,
  canCancelBooking,
  cancelingId,
  onCancel,
}) {
  const nights = calcNights(booking.checkIn, booking.checkOut);

  return (
    <div className="booking-modal-overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <div>
            <h2>Booking Details</h2>
            <p>Reservation #{booking.id}</p>
          </div>

          <button className="booking-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="booking-modal-body">
          <div className="booking-detail-hero">
  
    <div className="booking-detail-image-wrap">
      <img
        className="booking-detail-image-detail"
        src={booking.hotelImageUrl || "/hotel-placeholder.jpg"}
        alt={booking.hotelName || "Hotel"}
        onError={(e) => {
          e.currentTarget.src = "/hotel-placeholder.jpg";
        }}
      />
    </div>
          </div>

          <div className="booking-detail-grid">
            <DetailItem label="Guest Email" value={booking.guestEmail} />
            <DetailItem label="Room Type ID" value={booking.roomTypeId} />
            <DetailItem label="Hotel ID" value={booking.hotelId} />
            <DetailItem label="Guests" value={booking.guests} />
            <DetailItem label="Check In" value={formatDate(booking.checkIn)} />
            <DetailItem label="Check Out" value={formatDate(booking.checkOut)} />
            <DetailItem label="Nights" value={nights} />
            <DetailItem label="Created At" value={formatDate(booking.createdAt)} />
          </div>

          <div className="booking-detail-summary">
            <div>
              <span>Status</span>
              <strong className={`badge ${getStatusClass(booking.status)}`}>
                {booking.status}
              </strong>
            </div>

            <div>
              <span>Total Price</span>
              <strong>{formatMoney(booking.totalPrice)}</strong>
            </div>
          </div>
        </div>

        <div className="booking-modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>

          {canCancelBooking(booking.status) && (
            <button
              className="btn btn-danger"
              disabled={cancelingId === booking.id}
              onClick={() => onCancel(booking.id)}
            >
              {cancelingId === booking.id ? "Canceling..." : "Cancel Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="booking-detail-item">
      <span>{label}</span>
      <strong>{value || "N/A"}</strong>
    </div>
  );
}