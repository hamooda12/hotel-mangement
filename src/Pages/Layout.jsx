import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import '../FunctionsofTheProject/toast.css'
export function Layout() {
  return (
    <>
         
      <Header />
      <Outlet />
       <div id="toast-container" className="toast-container"></div>
    </>
  );
}