import React, { useState } from "react";
import "../Css/login.css";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logototal.png";
import { API_BASE, NGROK_SKIP_HEADER } from "../api/axios";

const Recuperar = () => {
  const navegacion = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPass = /^(?=.*[A-Z])(?=.*[$%&/_-]).{6,}$/;

  const handleSendCode = async (e) => {
    e.preventDefault();

    if (!regexCorreo.test(email.trim())) {
      setError("❌ Ingresa un correo electrónico válido.");
      return;
    }

    setError("");
    setMessage("");
    setSending(true);

    try {
      const response = await fetch(`${API_BASE}/users/reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_SKIP_HEADER,
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setCodeSent(true);
        setPasswordReset(false);
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage(data.message || "Código enviado. Revisa tu correo electrónico.");
        return;
      }

      const message = data?.message || "No fue posible enviar el código. Intenta de nuevo.";
      setError("❌ " + message);
    } catch (err) {
      console.error("Error enviando código:", err);
      setError("No se pudo contactar con el servidor.");
    } finally {
      setSending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!codeSent) {
      setError("❌ Primero debes solicitar el código.");
      return;
    }

    if (!/^\d{6}$/.test(code.trim())) {
      setError("❌ El código debe tener 6 dígitos.");
      return;
    }

    if (!regexPass.test(newPassword)) {
      setError("❌ La contraseña debe tener mínimo 6 caracteres, una mayúscula y un símbolo ($%&/_-).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }

    setError("");
    setMessage("");
    setResetting(true);

    try {
      const response = await fetch(`${API_BASE}/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_SKIP_HEADER,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        setPasswordReset(true);
        setMessage(data.message || "Contraseña actualizada. Ya puedes iniciar sesión.");
        setCode("");
        setNewPassword("");
        setConfirmPassword("");
        return;
      }

      const message = data?.message || "No fue posible restablecer la contraseña.";
      setError("❌ " + message);
    } catch (err) {
      console.error("Error restableciendo contraseña:", err);
      setError("No se pudo contactar con el servidor.");
    } finally {
      setResetting(false);
    }
  };

  const irLogin = () => navegacion("/login");

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <section className="h-100 gradient-form">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card shadow-lg border-0 rounded-4 text-black overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-6 bg-white">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center mb-4">
                      <img
                        src={Logo}
                        style={{ width: "180px" }}
                        alt="logo"
                        className="mb-3"
                      />
                      <h4 className="fw-bold">Recupera tu acceso</h4>
                    </div>

                    <form>
                      <p className="text-muted">Recibirás un código de verificación en tu correo registrado.</p>

                      {error && <div className="alert alert-danger py-2">{error}</div>}
                      {message && <div className="alert alert-success py-2">{message}</div>}

                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="emailRecuperar">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          id="emailRecuperar"
                          className="form-control form-control-lg"
                          placeholder="Ingresa tu correo"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="text-center mb-4">
                        <button
                          type="button"
                          className="btn btn-lg w-100 text-black gradient-btn shadow-sm"
                          onClick={handleSendCode}
                          disabled={sending}
                        >
                          {sending ? "Enviando..." : "Enviar código"}
                        </button>
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="codigoRecuperar">
                          Código de verificación
                        </label>
                        <input
                          type="text"
                          id="codigoRecuperar"
                          className="form-control form-control-lg"
                          placeholder="Ingresa el código de 6 dígitos"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          disabled={passwordReset}
                        />
                      </div>

                      <div className="form-outline mb-4 password-field">
                        <label className="form-label" htmlFor="nuevaContrasena">
                          Nueva contraseña
                        </label>
                        <input
                          type={showPassword.newPassword ? "text" : "password"}
                          id="nuevaContrasena"
                          className="form-control form-control-lg"
                          placeholder="Contraseña con mayúscula y símbolo"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={passwordReset}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("newPassword")}
                          aria-label={showPassword.newPassword ? "Ocultar nueva contraseña" : "Mostrar nueva contraseña"}
                          disabled={passwordReset}
                        >
                          {showPassword.newPassword ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>

                      <div className="form-outline mb-4 password-field">
                        <label className="form-label" htmlFor="confirmarContrasena">
                          Confirmar contraseña
                        </label>
                        <input
                          type={showPassword.confirmPassword ? "text" : "password"}
                          id="confirmarContrasena"
                          className="form-control form-control-lg"
                          placeholder="Confirma la nueva contraseña"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={passwordReset}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("confirmPassword")}
                          aria-label={showPassword.confirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                          disabled={passwordReset}
                        >
                          {showPassword.confirmPassword ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>

                      <div className="text-center pt-1 mb-4">
                        <button
                          type="button"
                          className="btn btn-lg w-100 text-black gradient-btn shadow-sm"
                          onClick={handleResetPassword}
                          disabled={resetting || passwordReset}
                        >
                          {resetting ? "Actualizando..." : "Restablecer contraseña"}
                        </button>
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <p className="mb-0 me-2">¿Recordaste tu contraseña?</p>
                        <button
                          type="button"
                          className="btn-crear"
                          onClick={irLogin}
                        >
                          Inicia sesión
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="col-lg-6 d-flex align-items-center gradient-custom-2 text-white">
                  <div className="px-4 py-5 mx-md-4">
                    <h4 className="fw-bold mb-4">Protegemos tu cuenta</h4>
                    <p className="small">
                      Para tu seguridad, el código expira a los 10 minutos. Si necesitas uno nuevo,
                      puedes solicitarlo desde esta misma pantalla.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recuperar;
