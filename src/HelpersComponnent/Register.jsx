export function Register({
  doRegister,
  RegisterFirstName,
  setRegisterFirstName,
  RegisterLastName,
  setRegisterLastName,
  RegisterEmail,
  setRegisterEmail,
  RegisterPass,
  setRegisterPass,
  RegisterPass2,
  setRegisterPass2
}) {
  return (
    <div className="auth-panel auth-register-panel">
      <div className="auth-copy">
        <span className="auth-eyebrow">Join Al-Qasr</span>
        <h2>Create your account</h2>
        <p>
          Become part of a refined booking experience designed for elegant stays,
          smooth reservations, and memorable hotel moments.
        </p>
      </div>

      <div className="auth-name-grid">
        <div className="form-group auth-field">
          <label className="form-label" htmlFor="r-fname">First Name</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">👤</span>
            <input
              id="r-fname"
              className="form-input auth-input"
              placeholder="Ahmed"
              value={RegisterFirstName}
              onChange={(e) => setRegisterFirstName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group auth-field">
          <label className="form-label" htmlFor="r-lname">Last Name</label>
          <div className="auth-input-wrap">
            <span className="auth-input-icon">◇</span>
            <input
              id="r-lname"
              className="form-input auth-input"
              placeholder="Al-Rashid"
              value={RegisterLastName}
              onChange={(e) => setRegisterLastName(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-group auth-field">
        <label className="form-label" htmlFor="r-email">Email Address</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✉</span>
          <input
            id="r-email"
            className="form-input auth-input"
            type="email"
            placeholder="you@example.com"
            value={RegisterEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group auth-field">
        <label className="form-label" htmlFor="r-pass">Password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">⌘</span>
          <input
            id="r-pass"
            className="form-input auth-input"
            type="password"
            placeholder="Min. 8 characters"
            value={RegisterPass}
            onChange={(e) => setRegisterPass(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group auth-field">
        <label className="form-label" htmlFor="r-pass2">Confirm Password</label>
        <div className="auth-input-wrap">
          <span className="auth-input-icon">✓</span>
          <input
            id="r-pass2"
            className="form-input auth-input"
            type="password"
            placeholder="Repeat your password"
            value={RegisterPass2}
            onChange={(e) => setRegisterPass2(e.target.value)}
          />
        </div>
      </div>

      <button className="btn btn-primary auth-submit" onClick={doRegister} type="submit">
        <span>Create Account</span>
        <strong>→</strong>
      </button>

      <div className="auth-trust-row">
        <span>Secure booking</span>
        <span>Private access</span>
        <span>Luxury stays</span>
      </div>
    </div>
  );
}