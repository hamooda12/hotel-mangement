export function Login({ doLogin, LoginEmail, setLoginEmail, LoginPass, setLoginPass }) {
  return (
    <div className="auth-panel auth-login-panel">
      <div className="auth-copy">
        <span className="auth-eyebrow">Luxury Access</span>
        <h2>Welcome back</h2>
        <p>
          Sign in to continue your hotel journey, manage bookings, and discover
          exclusive stays crafted for Al-Qasr guests.
        </p>
      </div>

      <div className="auth-benefits">
        <div className="auth-benefit">
          <span>✦</span>
          <p>Premium hotel reservations</p>
        </div>
        <div className="auth-benefit">
          <span>◆</span>
          <p>Fast booking history access</p>
        </div>
      </div>

      <div className="form-group auth-field">
        <label className="form-label" htmlFor="l-email">Email Address</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✉</span>
          <input
            id="l-email"
            className="form-input auth-input"
            type="email"
            placeholder="guest@alqasr.com"
            value={LoginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group auth-field">
        <label className="form-label" htmlFor="l-pass">Password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">⌘</span>
          <input
            id="l-pass"
            className="form-input auth-input"
            type="password"
            placeholder="Enter your password"
            value={LoginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-primary auth-submit" onClick={doLogin}>
        <span>Sign In</span>
        <strong>→</strong>
      </button>

      <div className="auth-hint">
        <span>Admin demo</span>
        <strong>admin@alqasr.com</strong>
      </div>
    </div>
  );
}