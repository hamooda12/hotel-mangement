export function Register({ doRegister, RegisterFirstName, setRegisterFirstName, RegisterLastName, setRegisterLastName, RegisterEmail, setRegisterEmail, RegisterPass, setRegisterPass, RegisterPass2, setRegisterPass2 }) {

    return <><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="form-group"><label className="form-label">First Name</label><input id="r-fname" className="form-input" placeholder="Ahmed" value={RegisterFirstName} onChange={(e) => setRegisterFirstName(e.target.value)}/></div>
        <div className="form-group"><label className="form-label">Last Name</label><input id="r-lname" className="form-input" placeholder="Al-Rashid" value={RegisterLastName} onChange={(e) => setRegisterLastName(e.target.value)}/></div>
      </div>
      <div className="form-group"><label className="form-label">Email</label><input id="r-email" className="form-input" type="email" value={RegisterEmail} onChange={(e) => setRegisterEmail(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Password</label><input id="r-pass" className="form-input" type="password" placeholder="Min. 8 characters" value={RegisterPass} onChange={(e) => setRegisterPass(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Confirm Password</label><input id="r-pass2" className="form-input" type="password" value={RegisterPass2} onChange={(e) => setRegisterPass2(e.target.value)}/></div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={doRegister} type="submit">
        Create Account →
      </button>
      </>
}