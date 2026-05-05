import "../../commonStyle.css";
import { useNavigate } from "react-router-dom";

export function Contact() {
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
          Contact Us
        </h1>

        <p style={{ color: "var(--text-muted)", lineHeight: "1.8" }}>
          Need help with a booking or hotel information? Contact our support team.
        </p>

        <div className="search-widget" style={{ marginTop: "2rem" }}>
          <p><strong>Phone:</strong> +970 599 000 000</p>
          <p><strong>Email:</strong> support@stayfinder.com</p>
          <p><strong>Location:</strong> Hebron, Palestine</p>
        </div>
      </div>
    </div>
  );
}