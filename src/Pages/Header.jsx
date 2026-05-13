import { useNavigate } from "react-router-dom";
import '../commonStyle.css'
import '../PagesStyles/header.css'
import { useState,useEffect } from "react";
import '../FunctionsofTheProject/toast.css'
import { showToast } from "../FunctionsofTheProject/HelperFunctions";
import { Login } from "../HelpersComponnent/Login";
import { Register } from "../HelpersComponnent/Register";
import axios from "axios";
export function Header() {
 const navigate = useNavigate();
 const [isDark, setIsDark] = useState(false);
  const [knob, setknob] = useState("");
   const [toggleLabel, setToggleLabel] = useState("");
  const  [isLogin,setIsLogin] = useState(false);
    const  [isLogout,setIsLogout] = useState(true);
    const[showBookingBtn,setShowBookingBtn] = useState(false);
    const[LoginEmail,setLoginEmail] = useState("guest@alqasr.com");
    const[LoginPass,setLoginPass] = useState("password123");
    const[RegisterDetails,setRegisterDetails] = useState({firstName:"",lastName:"",email:"",pass:"",pass2:""});
    
 const [currentUser, setCurrentUser] = useState(null); // Placeholder for user state management
 const [activeTab, setActiveTab] = useState('login');
useEffect(() => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  setCurrentUser(null);
  setIsLogin(false);
  setIsLogout(true);
  setShowBookingBtn(false);
}, []);
  useEffect(() => {
     document.documentElement.setAttribute(
       "data-theme",
       isDark ? "dark" : "light",
     );
   }, [isDark]);
   
function toggleTheme() {
    setIsDark(prev => !prev);
   
    setknob(isDark ? '☀' : '🌙')
    setToggleLabel(isDark ? 'Light' : 'Dark')
   showToast(
         !isDark ? "Dark mode enabled 🌙" : "Light mode enabled ☀",
         "info",
       );
  
}


function closeAuthModal() { document.getElementById('auth-modal').classList.remove('open'); }
async function doLogin() {
  if (!LoginEmail || !LoginPass) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    const res = await axios.post("http://localhost:8080/api/auth/login", {
      email: LoginEmail,
      password: LoginPass
    });

    console.log(res.data)
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);


    setCurrentUser({
      userName:res.data.userName,
      role:res.data.role,
      email: LoginEmail,
    });

    setIsLogin(true);
    setIsLogout(false);
    setShowBookingBtn(true);
    closeAuthModal();

    showToast("Login successful 🎉", "success");

  } catch (err) {
    showToast("Invalid email or password ❌", "error");
  }
}

async function doRegister() {
  if (!RegisterDetails.email || !RegisterDetails.pass || !RegisterDetails.pass2) {
    showToast("Fill all fields", "error");
    return;
  }

  if (RegisterDetails.pass !== RegisterDetails.pass2) {
    showToast("Passwords do not match", "error");
    return;
  }

  try {
    const res = await axios.post("http://localhost:8080/api/auth/register", {
     
      email: RegisterDetails.email,
      password: RegisterDetails.pass,
      userName:RegisterDetails.firstName
    });

    
    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("refreshToken", res.data.refreshToken);

    setCurrentUser({ email: RegisterDetails.email });
setIsLogin(true);
setIsLogout(false);
setShowBookingBtn(true);
    showToast(`Hello ${RegisterDetails.firstName}`, "success");
    closeAuthModal();

  } catch (err) {
  
    showToast("User already exists ❌", "error");
  }
}
function openAuthModal() { switchAuthTab('login'); document.getElementById('auth-modal').classList.add('open'); }

function switchAuthTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    setActiveTab(tab);
    if (tab === 'login') {
       return Login({ doLogin, LoginEmail, setLoginEmail, LoginPass, setLoginPass });
        
        } else {
              return Register({ doRegister, RegisterFirstName: RegisterDetails.firstName, setRegisterFirstName: (firstName) => setRegisterDetails({...RegisterDetails, firstName}), RegisterLastName: RegisterDetails.lastName, setRegisterLastName: ((lastName) => setRegisterDetails({...RegisterDetails, lastName})), RegisterEmail: RegisterDetails.email, setRegisterEmail: (email) => setRegisterDetails({...RegisterDetails, email}), RegisterPass: RegisterDetails.pass, setRegisterPass: (pass) => setRegisterDetails({...RegisterDetails, pass}), RegisterPass2: RegisterDetails.pass2, setRegisterPass2: (pass2) => setRegisterDetails({...RegisterDetails, pass2}) });
    }
}
function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  setCurrentUser(null);
  setIsLogin(false);
  setIsLogout(true);
  setShowBookingBtn(false);

  navigate("/home");
  showToast("Signed out successfully", "info");
}
    return (
        <nav>
           
  <div className="nav-brand" onClick={() => navigate("/home")}>
    <div className="nav-logo">ق</div>
    <span className="nav-title">Al-<span>Qasr</span></span>
  </div>
  <div className="nav-links">
    <button className="nav-btn" onClick={() => navigate("/home")} data-page="home">Home</button>
    <button className="nav-btn" onClick={() => navigate("/search")} data-page="search">Hotels</button>
    <button className="nav-btn" id="my-bookings-btn" onClick={() => navigate("/my-bookings")} data-page="my-bookings" style={{ display: showBookingBtn ? 'block' : 'none' }}>My Bookings</button>
    <button className="nav-btn" id="admin-btn" onClick={() => navigate("/admin")} data-page="admin" style={{ display: isLogin && currentUser.role==="ADMIN" ? 'block' : 'none' }}>Dashboard</button>

    <div className="theme-toggle" onClick={toggleTheme} title="Toggle dark/light mode">
      <div className="toggle-track"><div className="toggle-knob" id="toggle-knob">{knob}</div></div>
      <span className="toggle-label" id="toggle-label">{toggleLabel}</span>
    </div>
    <button className="nav-btn primary" id="login-btn" onClick={openAuthModal} style={{display:!isLogin?'block':'none'}}>Sign In</button>
    <button className="nav-btn" id="logout-btn" style={{ display: isLogout?'none': 'block', color: '#fca5a5' }} onClick={logout}>Sign Out</button>
  </div>
  <div className="modal-overlay" id="auth-modal">
  <div className="modal">
    <div className="modal-header">
      <span className="modal-title">Welcome to Al-Qasr</span>
      <button className="modal-close" onClick={closeAuthModal}>✕</button>
    </div>
    <div className="auth-tabs">
      <button className="auth-tab active" id="tab-login" onClick={() => switchAuthTab('login')}>Sign In</button>
      <button className="auth-tab" id="tab-register" onClick={() => switchAuthTab('register')}>Register</button>
    </div>
    <div id="auth-form-content">{activeTab === 'login' ? <Login doLogin={doLogin} LoginEmail={LoginEmail} setLoginEmail={setLoginEmail} LoginPass={LoginPass} setLoginPass={setLoginPass} /> : 
    <Register doRegister={doRegister} RegisterFirstName={RegisterDetails.firstName} setRegisterFirstName={(firstName) => setRegisterDetails({...RegisterDetails, firstName})} RegisterLastName={RegisterDetails.lastName} setRegisterLastName={((lastName) => setRegisterDetails({...RegisterDetails, lastName}))} RegisterEmail={RegisterDetails.email} setRegisterEmail={(email) => setRegisterDetails({...RegisterDetails, email})} RegisterPass={RegisterDetails.pass} setRegisterPass={(pass) => setRegisterDetails({...RegisterDetails, pass})} RegisterPass2={RegisterDetails.pass2} setRegisterPass2={(pass2) => setRegisterDetails({...RegisterDetails, pass2})} />}</div>
    
  </div>
 
</div>
</nav>
    )
}