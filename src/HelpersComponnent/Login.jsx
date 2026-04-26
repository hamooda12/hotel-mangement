export  function Login({doLogin , LoginEmail, setLoginEmail, LoginPass, setLoginPass}) {
    return <> <div className="form-group"><label className="form-label">Email</label><input id="l-email" className="form-input" type="email" value={LoginEmail} onChange={(e)=>setLoginEmail(e.target.value)}/></div>
      <div className="form-group"><label className="form-label">Password</label><input id="l-pass" className="form-input" type="password" value={LoginPass} onChange={(e)=>setLoginPass(e.target.value)}/></div>
      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: "1rem" }} onClick={doLogin}>Sign In →</button>
      <div style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)" }}>Use <strong>admin@alqasr.com</strong> for admin access</div>
</>
}