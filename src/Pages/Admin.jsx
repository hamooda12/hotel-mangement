import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import "../PagesStyles/admin.css";
import "../commonStyle.css";

import {
  getHotels,
  getRoomTypes,
  getAllBookings,
  createHotel,
  createRoomType,
} from "../api/hotelApi";

export function Admin() {
  const navigate = useNavigate();

  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const adminTabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "hotels", label: "🏨 Manage Hotels" },
    { id: "rooms", label: "🛏 Room Types" },
    { id: "bookings", label: "📋 Bookings" },
  ];

  useEffect(() => {
    loadAdminData();
  }, []);

  function extractList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
  }

  async function loadAdminData() {
    try {
      setLoading(true);
      setError("");

      const [hotelsData, roomsData, bookingsData] = await Promise.all([
        getHotels({ size: 100 }),
        getRoomTypes({ size: 100 }),
        getAllBookings(),
      ]);

      setHotels(extractList(hotelsData));
      setRooms(extractList(roomsData));
      setBookings(extractList(bookingsData));
    } catch (err) {
      console.error(err);
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  }

 async function handleAddHotel(hotelData) {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("You must login as admin first.");
      return;
    }

    await createHotel(hotelData);

    setIsHotelModalOpen(false);
    await loadAdminData();

    alert("Hotel added successfully!");
  } catch (err) {
    console.error(err);

    if (err.response?.status === 401) {
      alert("Unauthorized. Please login again as ADMIN.");
      return;
    }

    if (err.response?.status === 403) {
      alert("Forbidden. Your account does not have ADMIN permission.");
      return;
    }

    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      "Failed to add hotel.";

    alert(message);
  }
}

  async function handleAddRoom(roomData) {
    try {
      const { hotelId, ...roomPayload } = roomData;

      await createRoomType(hotelId, roomPayload);

      setIsRoomModalOpen(false);
      await loadAdminData();

      alert("Room type added successfully!");
    } catch (err) {
      console.error(err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to add room type.";

      alert(message);
    }
  }

  const totalRevenue = useMemo(() => {
    return bookings.reduce((sum, booking) => {
      return sum + Number(booking.totalPrice || booking.total || 0);
    }, 0);
  }, [bookings]);

  const recentBookings = useMemo(() => {
    return bookings.slice(0, 5);
  }, [bookings]);

  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 0;

    const bookedRooms = bookings.filter((b) => {
      const status = String(b.status || "").toUpperCase();

      return (
        status === "CONFIRMED" ||
        status === "UPCOMING" ||
        status === "PAID"
      );
    }).length;

    return Math.min(100, Math.round((bookedRooms / rooms.length) * 100));
  }, [rooms, bookings]);

  function formatMoney(value) {
    const num = Number(value || 0);
    return `$${num.toLocaleString()}`;
  }

  function formatDate(date) {
    if (!date) return "-";

    try {
      return new Date(date).toLocaleDateString("en-GB");
    } catch {
      return date;
    }
  }

  function getStatusClass(status) {
    const value = String(status || "").toUpperCase();

    if (value === "CONFIRMED" || value === "PAID" || value === "SUCCESS") {
      return "badge-emerald";
    }

    if (value === "UPCOMING" || value === "PENDING") {
      return "badge-gold";
    }

    return "badge-navy";
  }

  function getHotelNameById(hotelId) {
    const hotel = hotels.find((h) => Number(h.id) === Number(hotelId));
    return hotel?.name || "-";
  }

  function getRoomNameById(roomTypeId) {
    const room = rooms.find((r) => Number(r.id) === Number(roomTypeId));
    return room?.name || room?.typeName || "-";
  }

  function handleViewHotel(hotelId) {
    navigate(`/hotel/${hotelId}`);
  }

  if (loading) {
    return (
      <div className="page-active" id="page-active-admin">
        <div className="container" style={{ padding: "3rem 0" }}>
          <h2 className="amiri" style={{ color: "var(--navy)" }}>
            Loading admin dashboard...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-active" id="page-active-admin">
        <div className="container" style={{ padding: "3rem 0" }}>
          <div className="card">
            <div className="card-body">
              <h2 className="amiri" style={{ color: "var(--navy)" }}>
                Admin Dashboard
              </h2>

              <p style={{ color: "var(--danger)", marginTop: "1rem" }}>
                {error}
              </p>

              <button className="btn btn-primary" onClick={loadAdminData}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-active" id="page-active-admin">
      <div className="dashboard-grid">
        <aside className="sidebar">
          <div className="sidebar-title">✦ Admin Panel</div>

          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar-link ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        <main id="admin-content" style={{ overflow: "hidden", minWidth: 0 }}>
          {activeTab === "overview" && (
            <OverviewTab
              hotels={hotels}
              bookings={bookings}
              recentBookings={recentBookings}
              totalRevenue={totalRevenue}
              occupancyRate={occupancyRate}
              formatMoney={formatMoney}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
              getHotelNameById={getHotelNameById}
              getRoomNameById={getRoomNameById}
            />
          )}

          {activeTab === "hotels" && (
            <HotelsTab
              hotels={hotels}
              handleViewHotel={handleViewHotel}
              onOpenAddHotelModal={() => setIsHotelModalOpen(true)}
            />
          )}

          {activeTab === "rooms" && (
            <RoomsTab
              rooms={rooms}
              hotels={hotels}
              getHotelNameById={getHotelNameById}
              formatMoney={formatMoney}
              onOpenAddRoomModal={() => setIsRoomModalOpen(true)}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsTab
              bookings={bookings}
              formatMoney={formatMoney}
              formatDate={formatDate}
              getStatusClass={getStatusClass}
              getHotelNameById={getHotelNameById}
              getRoomNameById={getRoomNameById}
            />
          )}
        </main>
      </div>

      {isHotelModalOpen && (
        <AddHotelModal
          onClose={() => setIsHotelModalOpen(false)}
          onSubmit={handleAddHotel}
        />
      )}

      {isRoomModalOpen && (
        <AddRoomModal
          hotels={hotels}
          onClose={() => setIsRoomModalOpen(false)}
          onSubmit={handleAddRoom}
        />
      )}
    </div>
  );
}

function OverviewTab({
  hotels,
  bookings,
  recentBookings,
  totalRevenue,
  occupancyRate,
  formatMoney,
  formatDate,
  getStatusClass,
  getHotelNameById,
  getRoomNameById,
}) {
  return (
    <div className="fade-in">
      <h2
        className="amiri"
        style={{
          color: "var(--navy)",
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
        }}
      >
        Dashboard Overview
      </h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-val">{formatMoney(totalRevenue)}</div>
          <div className="metric-label">Total Revenue</div>
        </div>

        <div className="metric-card">
          <div className="metric-val">{bookings.length}</div>
          <div className="metric-label">Total Bookings</div>
        </div>

        <div className="metric-card">
          <div className="metric-val">{hotels.length}</div>
          <div className="metric-label">Active Hotels</div>
        </div>

        <div className="metric-card">
          <div className="metric-val">{occupancyRate}%</div>
          <div className="metric-label">Occupancy Rate</div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h3
            style={{
              fontFamily: "'Amiri', serif",
              color: "var(--navy)",
              marginBottom: "1rem",
            }}
          >
            Recent Bookings
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Hotel</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {recentBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No bookings yet.
                    </td>
                  </tr>
                ) : (
                  recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--emerald)",
                        }}
                      >
                        {booking.id}
                      </td>

                      <td style={{ fontWeight: 600 }}>
                        {booking.hotelName || getHotelNameById(booking.hotelId)}
                      </td>

                      <td style={{ fontSize: "13px" }}>
                        {booking.roomTypeName ||
                          getRoomNameById(booking.roomTypeId)}
                      </td>

                      <td style={{ fontSize: "12px" }}>
                        {formatDate(booking.checkIn)} →{" "}
                        {formatDate(booking.checkOut)}
                      </td>

                      <td
                        style={{
                          fontWeight: 700,
                          color: "var(--emerald)",
                        }}
                      >
                        {formatMoney(booking.totalPrice || booking.total)}
                      </td>

                      <td>
                        <span
                          className={`badge ${getStatusClass(booking.status)}`}
                        >
                          {booking.status || "UNKNOWN"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelsTab({ hotels, handleViewHotel, onOpenAddHotelModal }) {
  return (
    <div className="fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2
          className="amiri"
          style={{ color: "var(--navy)", fontSize: "1.8rem" }}
        >
          Manage Hotels
        </h2>

        <button className="btn btn-primary" onClick={onOpenAddHotelModal}>
          + Add Hotel
        </button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Hotel</th>
                <th>City</th>
                <th>Stars</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Min Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No hotels found.
                  </td>
                </tr>
              ) : (
                hotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {hotel.imageUrl ? (
                          <img
                            src={hotel.imageUrl}
                            alt={hotel.name}
                            style={{
                              width: "42px",
                              height: "42px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "42px",
                              height: "42px",
                              borderRadius: "10px",
                              background:
                                hotel.color ||
                                "linear-gradient(135deg,#0369a1,#0f766e)",
                            }}
                          />
                        )}

                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {hotel.name}
                        </span>
                      </div>
                    </td>

                    <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                      {hotel.city}
                    </td>

                    <td>
                      <span className="stars">
                        {"⭐".repeat(Number(hotel.stars || 0))}
                      </span>
                    </td>

                    <td style={{ color: "var(--text)" }}>
                      {hotel.rating ?? "-"}
                    </td>

                    <td style={{ color: "var(--text)" }}>
                      {hotel.reviews ?? 0}
                    </td>

                    <td style={{ fontWeight: 700, color: "var(--emerald)" }}>
                      ${Number(hotel.minPrice || 0).toLocaleString()}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleViewHotel(hotel.id)}
                        >
                          View
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => alert("Delete Hotel API later")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function RoomsTab({
  rooms,
  hotels,
  getHotelNameById,
  formatMoney,
  onOpenAddRoomModal,
}) {
  return (
    <div className="fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h2
          className="amiri"
          style={{ color: "var(--navy)", fontSize: "1.8rem" }}
        >
          Room Types
        </h2>

        <button
          className="btn btn-primary"
          onClick={onOpenAddRoomModal}
          disabled={hotels.length === 0}
          title={hotels.length === 0 ? "Add a hotel first" : ""}
        >
          + Add Room
        </button>
      </div>

      {hotels.length === 0 && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="card-body">
            <p style={{ color: "var(--text-muted)" }}>
              You need to add a hotel before creating room types.
            </p>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Room Type</th>
                <th>Hotel</th>
                <th>Capacity</th>
                <th>Total Rooms</th>
                <th>Price/Night</th>
                <th>Amenities</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No room types found.
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {room.imageUrl ? (
                          <img
                            src={room.imageUrl}
                            alt={room.name || room.typeName}
                            style={{
                              width: "38px",
                              height: "38px",
                              objectFit: "cover",
                              borderRadius: "10px",
                            }}
                          />
                        ) : (
                          <span>🛏</span>
                        )}

                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--text)",
                          }}
                        >
                          {room.name || room.typeName}
                        </span>
                      </div>
                    </td>

                    <td style={{ fontSize: "13px", color: "var(--text)" }}>
                      {room.hotelName || getHotelNameById(room.hotelId)}
                    </td>

                    <td style={{ color: "var(--text)" }}>
                      👤 Up to {room.capacity || room.maxGuests || "-"}
                    </td>

                    <td style={{ color: "var(--text)" }}>
                      {room.totalRooms ?? "-"}
                    </td>

                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--emerald)",
                      }}
                    >
                      {formatMoney(
                        room.basePrice || room.pricePerNight || room.price
                      )}
                      /night
                    </td>

                    <td style={{ fontSize: "13px", color: "var(--text)" }}>
                      {room.amenities || "-"}
                    </td>

                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => alert("Edit Room API later")}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => alert("Delete Room API later")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BookingsTab({
  bookings,
  formatMoney,
  formatDate,
  getStatusClass,
  getHotelNameById,
  getRoomNameById,
}) {
  return (
    <div className="fade-in">
      <h2
        className="amiri"
        style={{
          color: "var(--navy)",
          fontSize: "1.8rem",
          marginBottom: "1.5rem",
        }}
      >
        All Bookings
      </h2>

      <div className="card">
        <div className="card-body" style={{ padding: 0, overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Nights</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: "center" }}>
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "var(--emerald)",
                        cursor: "pointer",
                      }}
                    >
                      {booking.id}
                    </td>

                    <td style={{ fontSize: "13px", color: "var(--text)" }}>
                      {booking.guestEmail || booking.email || "-"}
                    </td>

                    <td
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "var(--text)",
                      }}
                    >
                      {booking.hotelName || getHotelNameById(booking.hotelId)}
                    </td>

                    <td style={{ fontSize: "13px", color: "var(--text)" }}>
                      {booking.roomTypeName ||
                        getRoomNameById(booking.roomTypeId)}
                    </td>

                    <td style={{ fontSize: "12px", color: "var(--text)" }}>
                      {formatDate(booking.checkIn)}
                    </td>

                    <td style={{ fontSize: "12px", color: "var(--text)" }}>
                      {formatDate(booking.checkOut)}
                    </td>

                    <td style={{ color: "var(--text)" }}>
                      {booking.nights || "-"}
                    </td>

                    <td
                      style={{
                        fontWeight: 700,
                        color: "var(--emerald)",
                      }}
                    >
                      {formatMoney(booking.totalPrice || booking.total)}
                    </td>

                    <td>
                      <span
                        className={`badge ${getStatusClass(booking.status)}`}
                      >
                        {booking.status || "UNKNOWN"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddHotelModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    description: "",
    managerEmail: "",
    imageUrl: "",
    color: "linear-gradient(135deg,#0369a1,#0f766e)",
    stars: 5,
    rating: 1.5,
    reviews: 0,
    minPrice: 100,
    amenitiesText: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const hotelPayload = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      address: formData.address.trim(),
      description: formData.description.trim(),
      managerEmail: formData.managerEmail.trim(),
      imageUrl: formData.imageUrl.trim(),
      imageEmoji: "",
      color: formData.color.trim(),
      stars: Number(formData.stars),
      rating: Number(formData.rating),
      reviews: Number(formData.reviews),
      minPrice: Number(formData.minPrice),
      amenities: formData.amenitiesText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      setSubmitting(true);
      await onSubmit(hotelPayload);
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="modal-overlay open" id="hotel-modal-overlay">
      <div className="modal hotel-modal">
        <div className="modal-header">
          <h2 id="hotel-modal-title" className="modal-title">
            Add New Hotel
          </h2>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} id="hotel-modal-body">
          <div className="form-group">
            <label className="form-label">Hotel Name *</label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ocean Grand Hotel Ramallah"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">City *</label>
            <input
              className="form-input"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="e.g. Ramallah, Palestine"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address *</label>
            <input
              className="form-input"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g. Al Masyoun, Ramallah"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Manager Email *</label>
            <input
              className="form-input"
              type="email"
              name="managerEmail"
              value={formData.managerEmail}
              onChange={handleChange}
              placeholder="manager@gmail.com"
              required
            />
          </div>

          <div className="hotel-modal-grid">
            <div className="form-group">
              <label className="form-label">Stars</label>
              <select
                className="form-input"
                name="stars"
                value={formData.stars}
                onChange={handleChange}
              >
                <option value="5">5</option>
                <option value="4">4</option>
                <option value="3">3</option>
                <option value="2">2</option>
                <option value="1">1</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Min Price ($)</label>
              <input
                className="form-input"
                type="number"
                min="50"
                name="minPrice"
                value={formData.minPrice}
                onChange={handleChange}
                placeholder="250"
              />
            </div>
          </div>

          <div className="hotel-modal-grid">
            <div className="form-group">
              <label className="form-label">Rating</label>
              <input
                className="form-input"
                type="number"
                min="1"
                max="10"
                step="0.1"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                placeholder="4.5"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reviews</label>
              <input
                className="form-input"
                type="number"
                min="0"
                name="reviews"
                value={formData.reviews}
                onChange={handleChange}
                placeholder="81"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              className="form-input"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/hotel.jpg"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Card Color / Gradient</label>
            <input
              className="form-input"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="linear-gradient(135deg,#0369a1,#0f766e)"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amenities</label>
            <input
              className="form-input"
              name="amenitiesText"
              value={formData.amenitiesText}
              onChange={handleChange}
              placeholder="Free WiFi, Pool, Spa, Restaurant"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              rows="3"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Write hotel description..."
            />
          </div>

          <div className="hotel-modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Hotel"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function AddRoomModal({ hotels, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    hotelId: hotels?.[0]?.id || "",
    name: "",
    capacity: 1,
    basePrice: "",
    amenities: "",
    totalRooms: 1,
      imageUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const roomPayload = {
      hotelId: Number(formData.hotelId),
      name: formData.name.trim(),
      capacity: Number(formData.capacity),
      basePrice: Number(formData.basePrice),
      amenities: formData.amenities.trim(),
      totalRooms: Number(formData.totalRooms),
    };

    if (!roomPayload.hotelId) {
      alert("Please select a hotel.");
      return;
    }

    if (!roomPayload.name) {
      alert("Room type name is required.");
      return;
    }

    if (roomPayload.capacity < 1) {
      alert("Capacity must be at least 1.");
      return;
    }

    if (roomPayload.basePrice <= 0) {
      alert("Base price must be greater than 0.");
      return;
    }

    if (roomPayload.totalRooms < 1) {
      alert("Total rooms must be at least 1.");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(roomPayload);
    } finally {
      setSubmitting(false);
    }
  }

  return createPortal(
    <div className="modal-overlay open" id="room-modal-overlay">
      <div className="modal hotel-modal">
        <div className="modal-header">
          <h2 className="modal-title">Add New Room Type</h2>

          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Hotel *</label>
            <select
              className="form-input"
              name="hotelId"
              value={formData.hotelId}
              onChange={handleChange}
              required
            >
              <option value="">Select hotel</option>

              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Room Type Name *</label>
            <input
              className="form-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Deluxe King Room"
              required
            />
          </div>

          <div className="hotel-modal-grid">
            <div className="form-group">
              <label className="form-label">Capacity *</label>
              <input
                className="form-input"
                type="number"
                min="1"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Rooms *</label>
              <input
                className="form-input"
                type="number"
                min="1"
                name="totalRooms"
                value={formData.totalRooms}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Base Price *</label>
            <input
              className="form-input"
              type="number"
              min="0.01"
              step="0.01"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleChange}
              placeholder="e.g. 120"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Amenities</label>
            <input
              className="form-input"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Free WiFi, Sea View, Air Conditioning"
            />
          </div>
          <div className="form-group">
  <label className="form-label">Room Image URL</label>
  <input
    className="form-input"
    name="imageUrl"
    value={formData.imageUrl}
    onChange={handleChange}
    placeholder="https://example.com/room-image.jpg"
  />
</div>

          <div className="hotel-modal-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Adding..." : "Add Room"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}