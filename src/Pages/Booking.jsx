import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createBooking,
  createPaymentIntent,
  simulatePayment,
} from "../api/hotelApi";

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

  if (!hotelId || !roomId) {
    return (
      <div className="page-active">
        <div
          className="container"
          style={{
            paddingTop: "2rem",
            paddingBottom: "4rem",
            maxWidth: "720px",
          }}
        >
          <div className="card">
            <div className="card-body">
              <h2 className="amiri" style={{ color: "var(--navy)" }}>
                Missing Booking Data
              </h2>

              <p style={{ color: "var(--text-mid)", marginBottom: "1rem" }}>
                Please go back and select a room first.
              </p>

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
    <div className="page-active" id="page-booking">
      <div
        className="container"
        style={{
          paddingTop: "2rem",
          paddingBottom: "4rem",
          maxWidth: "720px",
        }}
      >
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate(isConfirmExisting ? "/my-bookings" : -1)}
          style={{ marginBottom: "1.5rem" }}
        >
       {isConfirmExisting ? "← Back to My Bookings" : "← Back to Hotel"}
        </button>

        <h1
          className="amiri"
          style={{
            color: "var(--navy)",
            fontSize: "2rem",
            marginBottom: "1.5rem",
          }}
        >
          Complete Your Booking
        </h1>

        <div className="steps">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const done = stepNumber < bookingStep;
            const active = stepNumber === bookingStep;

            return (
              <div
                key={step}
                className={`step${active ? " active" : ""}${
                  done ? " done" : ""
                }`}
              >
                {done ? "✓" : <span className="step-num">{stepNumber}</span>}{" "}
                {step}
              </div>
            );
          })}
        </div>

        {bookingStep === 1 && (
          <div className="card fade-in">
            <div className="card-body">
              <div
                style={{
                  background: "var(--bg-nav)",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: "1.1rem",
                    }}
                  >
                    {hotelName}
                  </div>

                  <div style={{ fontSize: "13px", opacity: 0.75 }}>
                    {roomName} · {nights} nights
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "var(--gold-bright)",
                    }}
                  >
                    ${subtotal}
                  </div>

                  <div style={{ fontSize: "12px", opacity: 0.6 }}>total</div>
                </div>
              </div>

              <h3
                style={{
                  fontFamily: "'Amiri', serif",
                  color: "var(--navy)",
                  marginBottom: "1.25rem",
                }}
              >
                Guest Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input
                    name="fname"
                    className="form-input"
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
                    className="form-input"
                    placeholder="Al-Rashid"
                    value={guestInfo.lname}
                    onChange={handleChange}
                  />
                  <div className="form-error">{errors.lname}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  name="email"
                  className="form-input"
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
                  className="form-input"
                  placeholder="+970 59 000 0000"
                  value={guestInfo.phone}
                  onChange={handleChange}
                />
                <div className="form-error">{errors.phone}</div>
              </div>

              <h3
                style={{
                  fontFamily: "'Amiri', serif",
                  color: "var(--navy)",
                  marginTop: "1.5rem",
                  marginBottom: "1.25rem",
                }}
              >
                Stay Details
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Check-in *</label>
                  <input
                    type="date"
                    name="checkIn"
                    className="form-input"
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
                    className="form-input"
                    value={bookingDates.checkOut}
                    min={bookingDates.checkIn || today}
                    onChange={handleBookingDateChange}
                  />
                  <div className="form-error">{errors.checkOut}</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Guests *</label>
                <input
                  type="number"
                  name="guests"
                  className="form-input"
                  min="1"
                  value={bookingDates.guests}
                  onChange={handleBookingDateChange}
                />
                <div className="form-error">{errors.guests}</div>
              </div>

              <div
                style={{
                  background: "var(--bg-mid)",
                  padding: "1rem",
                  borderRadius: "12px",
                  marginTop: "1rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                  fontSize: "13px",
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Check-in
                  </div>
                  <strong>{bookingDates.checkIn}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Check-out
                  </div>
                  <strong>{bookingDates.checkOut}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Guests
                  </div>
                  <strong>{bookingDates.guests}</strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn btn-primary"
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
          <div className="card fade-in">
            <div className="card-body">
              <h3
                style={{
                  fontFamily: "'Amiri', serif",
                  color: "var(--navy)",
                  marginBottom: "1.25rem",
                }}
              >
                Payment Details
              </h3>

              <div
                style={{
                  background: "var(--bg-mid)",
                  borderRadius: "12px",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  border: "1px dashed var(--emerald-mid)",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--emerald)",
                  }}
                >
                  🔒 Secure mock payment interface
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  className="form-input"
                  defaultValue="4242 4242 4242 4242"
                  maxLength="19"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <select className="form-input" defaultValue="12">
                    <option value="12">12</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Year</label>
                  <select className="form-input" defaultValue="2026">
                    <option value="2026">2026</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">CVV</label>
                  <input
                    className="form-input"
                    type="password"
                    defaultValue="123"
                    maxLength="3"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Name on Card</label>
                <input
                  className="form-input"
                  defaultValue={`${guestInfo.fname} ${guestInfo.lname}`}
                />
              </div>

              <div className="price-breakdown">
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

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1.5rem",
                }}
              >
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
                  className="btn btn-primary"
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
          <div className="confirm-box fade-in">
            <span
              style={{
                fontSize: "4rem",
                display: "block",
                marginBottom: "1rem",
              }}
            >
              ✦
            </span>

            <h2
              className="amiri"
              style={{
                color: "var(--navy)",
                fontSize: "2rem",
                marginBottom: "0.5rem",
              }}
            >
              Booking Confirmed!
            </h2>

            <p style={{ color: "var(--text-mid)", marginBottom: "1rem" }}>
              Your reservation has been successfully completed.
            </p>

            <div className="confirm-code">Ref: {confirmationCode}</div>

            <div
              style={{
                background: "var(--bg-card)",
                borderRadius: "12px",
                padding: "1.25rem",
                maxWidth: "400px",
                margin: "1rem auto",
                textAlign: "left",
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  fontFamily: "'Amiri', serif",
                  fontSize: "1.1rem",
                  color: "var(--navy)",
                  marginBottom: "0.75rem",
                }}
              >
                {hotelName}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Room
                  </div>
                  <strong>{roomName}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Nights
                  </div>
                  <strong>{nights}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Check-in
                  </div>
                  <strong>{bookingDates.checkIn}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Check-out
                  </div>
                  <strong>{bookingDates.checkOut}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Guests
                  </div>
                  <strong>{bookingDates.guests}</strong>
                </div>

                <div>
                  <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    Total
                  </div>
                  <strong>${total}</strong>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-primary"
                onClick={() => navigate("/my-bookings")}
              >
                View My Bookings
              </button>

           <button
  className="btn btn-outline"
  onClick={() => navigate(returnTo || "/my-bookings")}
>
  Back to My Bookings
</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;