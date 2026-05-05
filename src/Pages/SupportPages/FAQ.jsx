import "../../commonStyle.css";
import { useNavigate } from "react-router-dom";

export function FAQ() {
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
          Frequently Asked Questions
        </h1>

        <div className="search-widget" style={{ marginTop: "2rem" }}>
          <h3>How can I find a hotel?</h3>
          <p>Use the search page to filter hotels by city, room type, and guests.</p>

          <h3>Can I view room details?</h3>
          <p>Yes, open any hotel card to see available room types, prices, capacity, and amenities.</p>

          <h3>Are the hotels real?</h3>
          <p>The platform displays selected hotel information including names, cities, rooms, and amenities.</p>
        </div>
      </div>
    </div>
  );
}