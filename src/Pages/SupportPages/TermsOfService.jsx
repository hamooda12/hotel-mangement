import "../../commonStyle.css";
import { useNavigate } from "react-router-dom";

export function TermsOfService() {
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
          Terms of Service
        </h1>

        <div className="search-widget" style={{ marginTop: "2rem" }}>
          <p>
            By using StayFinder, you agree to use the platform for lawful hotel
            browsing and booking purposes only.
          </p>

          <p>
            Hotel details, room availability, and prices may change depending on updates from the system.
          </p>

          <p>
            Users are responsible for providing accurate information when creating bookings.
          </p>
        </div>
      </div>
    </div>
  );
}