import "../../commonStyle.css";
import { useNavigate } from "react-router-dom";

export function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="page-active">
      <div className="container" style={{ padding: "4rem 0" }}>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => navigate("/home")}
          style={{ marginBottom: "1.5rem" }}
        >
          ← Back to Home
        </button>

        <h1 className="amiri" style={{ color: "var(--navy)" }}>
          Privacy Policy
        </h1>

        <div className="search-widget" style={{ marginTop: "2rem" }}>
          <p>
            We respect your privacy. This platform may collect basic account and booking
            information only to provide hotel search and booking services.
          </p>

          <p>
            Your personal information is not sold or shared with third parties for marketing purposes.
          </p>

          <p>
            Booking-related information is used only to manage reservations and improve user experience.
          </p>
        </div>
      </div>
    </div>
  );
}