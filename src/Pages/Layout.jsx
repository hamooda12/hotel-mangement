import { Header } from "./Header";
import { Outlet } from "react-router-dom";
import "../FunctionsofTheProject/toast.css";
import { AiAssistant } from "../HelpersComponnent/AiAssistant";

export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <AiAssistant />
      <div id="toast-container" className="toast-container"></div>
    </>
  );
}
