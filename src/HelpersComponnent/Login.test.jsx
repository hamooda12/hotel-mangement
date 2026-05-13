import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { Login } from "./Login";

describe("Login Component", () => {
  test("renders login form correctly", () => {
    render(
      <Login
        doLogin={vi.fn()}
        LoginEmail=""
        setLoginEmail={vi.fn()}
        LoginPass=""
        setLoginPass={vi.fn()}
      />
    );

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/admin demo/i)).toBeInTheDocument();
    expect(screen.getByText(/admin@alqasr.com/i)).toBeInTheDocument();
  });

  test("calls setLoginEmail when user types email", () => {
    const setLoginEmail = vi.fn();

    render(
      <Login
        doLogin={vi.fn()}
        LoginEmail=""
        setLoginEmail={setLoginEmail}
        LoginPass=""
        setLoginPass={vi.fn()}
      />
    );

    const emailInput = screen.getByLabelText(/email address/i);

    fireEvent.change(emailInput, {
      target: { value: "test@example.com" },
    });

    expect(setLoginEmail).toHaveBeenCalledWith("test@example.com");
  });

  test("calls setLoginPass when user types password", () => {
    const setLoginPass = vi.fn();

    render(
      <Login
        doLogin={vi.fn()}
        LoginEmail=""
        setLoginEmail={vi.fn()}
        LoginPass=""
        setLoginPass={setLoginPass}
      />
    );

    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(passwordInput, {
      target: { value: "123456" },
    });

    expect(setLoginPass).toHaveBeenCalledWith("123456");
  });

  test("calls doLogin when sign in button is clicked", () => {
    const doLogin = vi.fn();

    render(
      <Login
        doLogin={doLogin}
        LoginEmail="admin@alqasr.com"
        setLoginEmail={vi.fn()}
        LoginPass="123456"
        setLoginPass={vi.fn()}
      />
    );

    const loginButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.click(loginButton);

    expect(doLogin).toHaveBeenCalledTimes(1);
  });
});