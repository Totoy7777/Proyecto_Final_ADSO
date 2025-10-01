import React, { useState } from "react";
import "../Css/login.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logototal.png";
import { API_BASE, NGROK_SKIP_HEADER } from "../api/axios";


const Registro = () => {
  const navegacion = useNavigate();

  const irLogin = () => {
    navegacion("/login");
  };

  // 1. AÑADIMOS LOS NUEVOS CAMPOS AL ESTADO
  const [formData, setFormData] = useState({
    nombre: "",
    tipoDoc: "",
    numeroDoc: "",
    telefono: "",
    email: "",
    direccion: "",
    password: "",
    confirmPass: "",
  });

  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPass: false,
  });

  const handleChange = (e) => {
    const { id, name, value, type, checked } = e.target;
    const key = name || id;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 2. EXTRAEMOS LOS NUEVOS VALORES
    const { nombre, tipoDoc, numeroDoc, telefono, email, direccion, password, confirmPass } = formData;

    // 3. ACTUALIZAMOS LA VALIDACIÓN DE CAMPOS VACÍOS
    if (!nombre || !tipoDoc || !numeroDoc || !telefono || !email || !direccion || !password || !confirmPass) {
      setError("⚠️ Todos los campos son obligatorios.");
      return;
    }

    // ✅ Validar que el número de documento solo tenga números
    if (!/^\d+$/.test(numeroDoc)) {
      setError("❌ El número de documento solo debe contener números.");
      return;
    }

    // ✅ NUEVA VALIDACIÓN: Teléfono (ej: 7 a 10 dígitos)
    if (!/^\d{7,10}$/.test(telefono)) {
      setError("❌ El número de teléfono debe tener entre 7 y 10 dígitos.");
      return;
    }

    // ✅ NUEVA VALIDACIÓN: Correo electrónico
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(email)) {
      setError("❌ El formato del correo electrónico no es válido.");
      return;
    }

    // ✅ Validar contraseña con regex
    const regexPass = /^(?=.*[A-Z])(?=.*[$%&/_-]).{6,}$/;
    if (!regexPass.test(password)) {
      setError(
        "❌ La contraseña debe tener mínimo 6 caracteres, al menos una mayúscula y un símbolo"
      );
      return;
    }

    if (password !== confirmPass) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }

    try {
      const payload = {
        nombre,
        telefono,
        email: email.trim().toLowerCase(),
        direccion,
        password,
        tipoDoc,
        numeroDoc,
      };

      const response = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...NGROK_SKIP_HEADER,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (response.ok && data?.success) {
        alert("✅ " + (data.message || "Usuario registrado con éxito"));
        navegacion("/login");
        return;
      }

      if (response.status === 409) {
        setError("❌ Este correo ya está registrado. Ingresa con tu cuenta desde el botón 'Ingresa'.");
        return;
      }

      const message = data?.message || "No fue posible completar el registro.";
      setError("❌ " + message);
    } catch (error) {
      console.error("Error: ", error);
      setError("No se pudo conectar con el servidor.");
    }

    // Se eliminó el alert("✅ Registro exitoso") de aquí para evitar que se muestre dos veces.
  };

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
                {/* Columna izquierda */}
                <div className="col-lg-6 bg-white">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center mb-4">
                      <img
                        src={Logo}
                        style={{ width: "180px" }}
                        alt="logo"
                        className="mb-3"
                      />
                      <h4 className="fw-bold"></h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <p className="text-muted">Completa Para Registrarte</p>

                      {/* Nombre */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="nombre">
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          id="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Nombre"
                          required
                        />
                      </div>

                      {/* Tipo de Documento */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="tipoDoc">
                          Tipo Documento
                        </label>
                        <select
                          id="tipoDoc"
                          value={formData.tipoDoc}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          required
                        >
                          <option value="">
                            Selecciona Tu Tipo De Documento
                          </option>
                          <option value="ti">Tarjeta de Identidad</option>
                          <option value="cc">Cédula de Ciudadanía</option>
                          <option value="ce">Cédula de Extranjería</option>
                          <option value="pp">Pasaporte</option>
                        </select>
                      </div>

                      {/* Documento */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="numeroDoc">
                          Numero Documento
                        </label>
                        <input
                          type="text"
                          id="numeroDoc"
                          value={formData.numeroDoc}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa Tu Numero De Documento"
                          required
                        />
                      </div>

                      {/* 5. AÑADIMOS LOS NUEVOS CAMPOS AL FORMULARIO (JSX) */}
                      
                      {/* Teléfono - NUEVO CAMPO */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="telefono">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="telefono"
                          value={formData.telefono}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa tu teléfono"
                          required
                        />
                      </div>

                      {/* Correo - NUEVO CAMPO */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="email">
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa tu correo"
                          required
                        />
                      </div>

                      {/* Dirección - NUEVO CAMPO */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="direccion">
                          Dirección
                        </label>
                        <input
                          type="text"
                          id="direccion"
                          value={formData.direccion}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa tu dirección"
                          required
                        />
                      </div>

                      {/* Contraseña */}
                      <div className="form-outline mb-4 password-field">
                        <label className="form-label" htmlFor="password">
                          Contraseña
                        </label>
                        <input
                          type={showPassword.password ? "text" : "password"}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa Contraseña"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("password")}
                          aria-label={showPassword.password ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword.password ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>

                      {/* Confirmar Contraseña */}
                      <div className="form-outline mb-4 password-field">
                        <label className="form-label" htmlFor="confirmPass">
                          Confirma Contraseña
                        </label>
                        <input
                          type={showPassword.confirmPass ? "text" : "password"}
                          id="confirmPass"
                          value={formData.confirmPass}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Confirma Contraseña"
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => togglePasswordVisibility("confirmPass")}
                          aria-label={showPassword.confirmPass ? "Ocultar confirmación" : "Mostrar confirmación"}
                        >
                          {showPassword.confirmPass ? "Ocultar" : "Mostrar"}
                        </button>
                      </div>

                      {/* Mensaje de error */}
                      {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                      )}

                      {/* Botón registro */}
                      <div className="text-center pt-1 mb-4">
                        <button
                          className="btn btn-lg w-100 text-black gradient-btn shadow-sm mb-3"
                          type="submit"
                        >
                          Registrar
                        </button>
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <p className="mb-0 me-2">Ya tienes una Cuenta?</p>
                        <button
                          onClick={irLogin}
                          type="button"
                          className="btn-crear"
                        >
                          Ingresa
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Columna derecha */}
                <div className="col-lg-6 d-flex align-items-center gradient-custom-2 text-white">
                  <div className="px-4 py-5 mx-md-4">
                    <h4 className="fw-bold mb-4">Acerca De Nuestra Compañia</h4>
                    <p className="small">
                      En nuestra compañia el criterio mas importante es la
                      felicidad de nuestros apreciados usuarios y clientes, por
                      tal motivo nos esforzamos al maximo para lograr que estos
                      tengan una buena experiencia con nosotros y se vayan
                      felices a sus hogares.
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

export default Registro;
