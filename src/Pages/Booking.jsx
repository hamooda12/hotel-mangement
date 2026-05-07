import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createBooking,
  createPaymentIntent,
  simulatePayment,
} from "../api/hotelApi";
import "../commonStyle.css";
import "../PagesStyles/Booking.css";

function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    mode,
    returnTo = "/",
    bookingId,
    hotelId,
    roomId,
    hotelName,
    roomName,
    price,
    totalPrice,
    checkIn,
    checkOut,
    guests,
    referenceCode,
  } = location.state || {};

  const isConfirmExisting = mode === "confirm-existing";

  const today = new Date().toISOString().split("T")[0];

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [bookingDates, setBookingDates] = useState({
    checkIn: checkIn || today,
    checkOut: checkOut || tomorrow,
    guests: guests || 1,
  });

  const [bookingStep, setBookingStep] = useState(isConfirmExisting ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(
    isConfirmExisting
      ? {
          id: bookingId,
          referenceCode,
          totalPrice,
        }
      : null
  );
  const [confirmationCode, setConfirmationCode] = useState("");

  const [guestInfo, setGuestInfo] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});

  const steps = ["Guest Info", "Payment", "Confirmation"];

  const nights = useMemo(() => {
    const checkInDate = new Date(bookingDates.checkIn);
    const checkOutDate = new Date(bookingDates.checkOut);

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  }, [bookingDates.checkIn, bookingDates.checkOut]);

  const roomPrice = price || 0;
  const subtotal = roomPrice * nights;
  const taxes = Math.round(subtotal * 0.1);
  const total = Math.round(subtotal * 1.1);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setGuestInfo((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleBookingDateChange = (event) => {
    const { name, value } = event.target;

    setBookingDates((prev) => {
      if (name === "checkIn") {
        return {
          ...prev,
          checkIn: value,
          checkOut: prev.checkOut <= value ? "" : prev.checkOut,
        };
      }

      return {
        ...prev,
        [name]: name === "guests" ? Number(value) : value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validateGuestInfo = () => {
    const newErrors = {};

    if (!guestInfo.fname.trim()) {
      newErrors.fname = "First name is required";
    }

    if (!guestInfo.lname.trim()) {
      newErrors.lname = "Last name is required";
    }

    if (!guestInfo.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (guestInfo.email && !/\S+@\S+\.\S+/.test(guestInfo.email)) {
      newErrors.email = "Email is not valid";
    }

    if (!guestInfo.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!bookingDates.checkIn) {
      newErrors.checkIn = "Check-in date is required";
    }

    if (!bookingDates.checkOut) {
      newErrors.checkOut = "Check-out date is required";
    }

    if (
      bookingDates.checkIn &&
      bookingDates.checkOut &&
      bookingDates.checkOut <= bookingDates.checkIn
    ) {
      newErrors.checkOut = "Check-out must be after check-in";
    }

    if (!bookingDates.guests || bookingDates.guests < 1) {
      newErrors.guests = "At least 1 guest is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const submitStep1 = async () => {
    if (!validateGuestInfo()) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("Please sign in first");
      navigate("/");
      return;
    }

    if (!roomId) {
      alert("Room ID is missing");
      return;
    }

    setLoading(true);

    try {
      const bookingRequest = {
        guestEmail: guestInfo.email,
        roomTypeId: roomId,
        checkIn: bookingDates.checkIn,
        checkOut: bookingDates.checkOut,
        guests: bookingDates.guests,
      };

      const bookingResponse = await createBooking(bookingRequest);

      setCreatedBooking(bookingResponse);
      setBookingStep(2);
    } catch (error) {
      console.error("Create booking error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to create booking"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async () => {
    if (!createdBooking?.id) {
      alert("Booking was not created yet");
      return;
    }

    setLoading(true);

    try {
      const paymentIntentResponse = await createPaymentIntent({
        bookingId: createdBooking.id,
      });

      const paymentId =
        paymentIntentResponse.id || paymentIntentResponse.paymentId;

      if (!paymentId) {
        throw new Error("Payment ID was not returned from backend");
      }

      await simulatePayment(paymentId, "SUCCESS");

      const code =
        createdBooking.referenceCode ||
        createdBooking.code ||
        `AQ${createdBooking.id}`;

      setConfirmationCode(code);
      setBookingStep(3);
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Payment failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const formattedHotelName = hotelName || "Selected hotel";
  const formattedRoomName = roomName || "Selected room";

  if (!hotelId || !roomId) {
    return (
      <div className="page-active booking-page-shell">
        <div className="booking-container booking-container-narrow">
          <div className="booking-missing-card card">
            <div className="card-body">
              <div className="booking-missing-icon">!</div>
              <h2 className="amiri">Missing Booking Data</h2>
              <p>Please go back and select a room first.</p>
              <button className="btn btn-primary" onClick={() => navigate(-1)}>
                Back to Hotel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-active booking-page-shell" id="page-booking">
      <div className="booking-container">
        <div className="booking-topbar">
          <button
            className="booking-back-btn btn btn-outline btn-sm"
            onClick={() => navigate(isConfirmExisting ? "/my-bookings" : -1)}
          >
            {isConfirmExisting ? "← Back to My Bookings" : "← Back to Hotel"}
          </button>

          <div className="booking-trust-strip" aria-label="Booking trust signals">
            <span>Best price preview</span>
            <span>Secure checkout</span>
            <span>No hidden flow changes</span>
          </div>
        </div>

        <section className="booking-hero-panel">
          <div className="booking-hero-content">
            <span className="booking-eyebrow">Hotel reservation checkout</span>
            <h1 className="amiri">Complete Your Booking</h1>
            <p>
              Review your stay, enter your details, and confirm your reservation
              in a clean secure checkout experience.
            </p>
          </div>

          <div className="booking-hero-mini-card">
            <span>Selected stay</span>
            <strong>{nights} night{nights === 1 ? "" : "s"}</strong>
            <small>{bookingDates.guests} guest{bookingDates.guests === 1 ? "" : "s"}</small>
          </div>
        </section>

        <div className="booking-stepper" role="list" aria-label="Booking steps">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const done = stepNumber < bookingStep;
            const active = stepNumber === bookingStep;

            return (
              <div
                key={step}
                className={`booking-step${active ? " active" : ""}${
                  done ? " done" : ""
                }`}
                role="listitem"
              >
                <span className="booking-step-circle">
                  {done ? "✓" : <span className="step-num">{stepNumber}</span>}
                </span>
                <span className="booking-step-label">{step}</span>
              </div>
            );
          })}
        </div>

        <main className="booking-layout">
          <section className="booking-main-column">
            {bookingStep === 1 && (
              <div className="booking-section-card card fade-in">
                <div className="card-body booking-card-body">
                  <div className="booking-section-header">
                    <div>
                      <span className="booking-section-kicker">Step 1</span>
                      <h2 className="amiri">Guest information</h2>
                      <p>Enter the guest details exactly as you want them on the reservation.</p>
                    </div>
                    <span className="booking-section-badge">Required</span>
                  </div>

                  <div className="booking-form-grid two-columns">
                    <div className="form-group">
                      <label className="form-label">First Name *</label>
                      <input
                        name="fname"
                        className="form-input booking-input"
                        placeholder="Ahmed"
                        value={guestInfo.fname}
                        onChange={handleChange}
                      />
                      <div className="form-error">{errors.fname}</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Last Name *</label>
                      <input
                        name="lname"
                        className="form-input booking-input"
                        placeholder="Al-Rashid"
                        value={guestInfo.lname}
                        onChange={handleChange}
                      />
                      <div className="form-error">{errors.lname}</div>
                    </div>
                  </div>

                  <div className="booking-form-grid two-columns">
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input
                        name="email"
                        className="form-input booking-input"
                        placeholder="ahmed@example.com"
                        type="email"
                        value={guestInfo.email}
                        onChange={handleChange}
                      />
                      <div className="form-error">{errors.email}</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone *</label>
                      <input
                        name="phone"
                        className="form-input booking-input"
                        placeholder="+970 59 000 0000"
                        value={guestInfo.phone}
                        onChange={handleChange}
                      />
                      <div className="form-error">{errors.phone}</div>
                    </div>
                  </div>

                  <div className="booking-section-divider" />

                  <div className="booking-section-header compact">
                    <div>
                      <span className="booking-section-kicker">Stay details</span>
                      <h3 className="amiri">Choose your dates</h3>
                      <p>Your checkout date must be after your check-in date.</p>
                    </div>
                  </div>

                  <div className="booking-form-grid three-columns">
                    <div className="form-group">
                      <label className="form-label">Check-in *</label>
                      <input
                        type="date"
                        name="checkIn"
                        className="form-input booking-input"
                        value={bookingDates.checkIn}
                        min={today}
                        onChange={handleBookingDateChange}
                      />
                      <div className="form-error">{errors.checkIn}</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Check-out *</label>
                      <input
                        type="date"
                        name="checkOut"
                        className="form-input booking-input"
                        value={bookingDates.checkOut}
                        min={bookingDates.checkIn || today}
                        onChange={handleBookingDateChange}
                      />
                      <div className="form-error">{errors.checkOut}</div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Guests *</label>
                      <input
                        type="number"
                        name="guests"
                        className="form-input booking-input"
                        min="1"
                        value={bookingDates.guests}
                        onChange={handleBookingDateChange}
                      />
                      <div className="form-error">{errors.guests}</div>
                    </div>
                  </div>

                  <div className="booking-live-summary">
                    <div>
                      <span>Check-in</span>
                      <strong>{bookingDates.checkIn || "Select date"}</strong>
                    </div>
                    <div>
                      <span>Check-out</span>
                      <strong>{bookingDates.checkOut || "Select date"}</strong>
                    </div>
                    <div>
                      <span>Guests</span>
                      <strong>{bookingDates.guests}</strong>
                    </div>
                    <div>
                      <span>Nights</span>
                      <strong>{nights}</strong>
                    </div>
                  </div>

                  <div className="booking-actions-row end">
                    <button
                      className="btn btn-primary booking-primary-action"
                      onClick={submitStep1}
                      disabled={loading}
                    >
                      {loading ? "Creating Booking..." : "Continue to Payment →"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="booking-section-card card fade-in">
                <div className="card-body booking-card-body">
                  <div className="booking-section-header">
                    <div>
                      <span className="booking-section-kicker">Step 2</span>
                      <h2 className="amiri">Payment details</h2>
                      <p>Use the mock card details below to complete the simulated payment.</p>
                    </div>
                    <span className="booking-section-badge secure">Secure</span>
                  </div>

                  <div className="payment-security-banner">
                    <span className="payment-lock">🔒</span>
                    <div>
                      <strong>Secure mock payment interface</strong>
                      <p>Your booking flow stays exactly the same; this section is styled only.</p>
                    </div>
                  </div>

                  <div className="payment-card-preview" aria-hidden="true">
                    <div className="payment-card-topline">
                      <span>Premium Stay Card</span>
                      <span>••/••</span>
                    </div>
                    <div className="payment-card-number">4242 4242 4242 4242</div>
                    <div className="payment-card-footerline">
                      <span>{guestInfo.fname || "Guest"} {guestInfo.lname || "Name"}</span>
                      <span>12 / 2026</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      className="form-input booking-input"
                      defaultValue="4242 4242 4242 4242"
                      maxLength="19"
                    />
                  </div>

                  <div className="booking-form-grid three-columns payment-grid">
                    <div className="form-group">
                      <label className="form-label">Month</label>
                      <select className="form-input booking-input" defaultValue="12">
                        <option value="12">12</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Year</label>
                      <select className="form-input booking-input" defaultValue="2026">
                        <option value="2026">2026</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input
                        className="form-input booking-input"
                        type="password"
                        defaultValue="123"
                        maxLength="3"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Name on Card</label>
                    <input
                      className="form-input booking-input"
                      defaultValue={`${guestInfo.fname} ${guestInfo.lname}`}
                    />
                  </div>

                  <div className="price-breakdown booking-price-breakdown">
                    <div className="pb-row">
                      <span>Room rate</span>
                      <span>${roomPrice}/night</span>
                    </div>

                    <div className="pb-row">
                      <span>Nights</span>
                      <span>{nights}</span>
                    </div>

                    <div className="pb-row">
                      <span>Subtotal</span>
                      <span>${subtotal}</span>
                    </div>

                    <div className="pb-row">
                      <span>Taxes & fees 10%</span>
                      <span>${taxes}</span>
                    </div>

                    <div className="pb-row pb-total">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>

                  <div className="booking-actions-row split">
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        if (isConfirmExisting) {
                          navigate("/my-bookings");
                        } else {
                          setBookingStep(1);
                        }
                      }}
                      disabled={loading}
                    >
                      ← Back
                    </button>

                    <button
                      className="btn btn-primary booking-primary-action"
                      onClick={submitPayment}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : `Pay $${total} →`}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="confirmation-card confirm-box fade-in">
                <div className="confirmation-icon">✓</div>

                <span className="booking-section-kicker">Reservation secured</span>
                <h2 className="amiri">Booking Confirmed!</h2>

                <p>
                  Your reservation has been successfully completed. Keep your reference
                  code for check-in and booking support.
                </p>

                <div className="confirm-code">Ref: {confirmationCode}</div>

                <div className="confirmation-receipt">
                  <div className="confirmation-hotel-block">
                    <span>Hotel</span>
                    <strong>{formattedHotelName}</strong>
                    <small>{formattedRoomName}</small>
                  </div>

                  <div className="confirmation-grid">
                    <div>
                      <span>Room</span>
                      <strong>{formattedRoomName}</strong>
                    </div>

                    <div>
                      <span>Nights</span>
                      <strong>{nights}</strong>
                    </div>

                    <div>
                      <span>Check-in</span>
                      <strong>{bookingDates.checkIn}</strong>
                    </div>

                    <div>
                      <span>Check-out</span>
                      <strong>{bookingDates.checkOut}</strong>
                    </div>

                    <div>
                      <span>Guests</span>
                      <strong>{bookingDates.guests}</strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>${total}</strong>
                    </div>
                  </div>
                </div>

                <div className="booking-actions-row center">
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate("/my-bookings")}
                  >
                    View My Bookings
                  </button>

                  <button className="btn btn-outline" onClick={() => navigate("/")}>
                    Back to Home
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="booking-summary-card" aria-label="Reservation summary">
            <div className="booking-summary-image">
              <div className="booking-summary-image-overlay">
                <span>Luxury stay</span>
                <strong>{formattedHotelName}</strong>
              </div>
            </div>

            <div className="booking-summary-body">
              <div className="booking-summary-title-row">
                <div>
                  <span className="booking-section-kicker">Reservation summary</span>
                  <h3 className="amiri">{formattedHotelName}</h3>
                  <p>{formattedRoomName}</p>
                </div>
                <span className="booking-rating-pill">8.9</span>
              </div>

              <div className="booking-summary-chips">
                <span>{nights} night{nights === 1 ? "" : "s"}</span>
                <span>{bookingDates.guests} guest{bookingDates.guests === 1 ? "" : "s"}</span>
                <span>Hotel ID {hotelId}</span>
              </div>

              <div className="booking-summary-dates">
                <div>
                  <span>Check-in</span>
                  <strong>{bookingDates.checkIn || "—"}</strong>
                </div>
                <div>
                  <span>Check-out</span>
                  <strong>{bookingDates.checkOut || "—"}</strong>
                </div>
              </div>

              <div className="booking-summary-lines">
                <div className="booking-summary-row">
                  <span>Room rate</span>
                  <strong>${roomPrice}/night</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Subtotal</span>
                  <strong>${subtotal}</strong>
                </div>
                <div className="booking-summary-row">
                  <span>Taxes & fees</span>
                  <strong>${taxes}</strong>
                </div>
                <div className="booking-summary-row booking-total-row">
                  <span>Total</span>
                  <strong>${total}</strong>
                </div>
              </div>

              <div className="booking-summary-note">
                <span>✓</span>
                <p>Your booking details are calculated live from the same page state.</p>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default BookingPage;
