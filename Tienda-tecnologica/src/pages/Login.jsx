import React, { useState } from "react";
import "../Css/login.css"
import Logo from "../assets/Logototal.png"

import { useNavigate } from "react-router-dom";

const Login = () => {
  const navegacion = useNavigate();

  const irRegistro = () => {
    navegacion("/registro");
  };

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Estado para errores
  const [error, setError] = useState("");

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Enviar datos al backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔹 Validación frontend
    if (!formData.email.trim() || !formData.password.trim()) {
      setError("⚠️ Todos los campos son obligatorios.");
      return;
    }

    if (formData.password.length < 6) {
      setError("⚠️ La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setError(""); // limpio errores

try {
  const payload = {
    email: formData.email.trim().toLowerCase(), // normaliza email
    password: formData.password,                // la contraseña tal cual
  };

  const response = await fetch("http://localhost:8080/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Error en el login");
  }

  const data = await response.json();
  console.log("Respuesta del backend:", data);

  // ✅ Si llegamos aquí, login fue exitoso
  navegacion("/");

} catch (error) {
  console.error("Error:", error);
  setError("❌ Usuario o contraseña incorrectos.");
}

 
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
                      <h4 className="fw-bold">Pide Cuando Quieras</h4>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSubmit}>
                      <p className="text-muted"></p>

                      {/* Mensaje de error */}
                      {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                      )}

                      {/* Nombre */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="form2Example11">
                          Usuario
                        </label>
                        <input
                          type="text"
                          id="form2Example11"
                          className="form-control form-control-lg"
                          placeholder="Correo electronico"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Contraseña */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="form2Example22">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          id="form2Example22"
                          className="form-control form-control-lg"
                          placeholder="Ingrese Contraseña"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Botón ingresar */}
                      <div className="text-center pt-1 mb-4">
                        <button
                          className="btn btn-lg w-100 text-black gradient-btn shadow-sm mb-3"
                          type="submit"
                        >
                          Ingresar
                        </button>
                      </div>

                      {/* Enlace a registro */}
                      <div className="d-flex align-items-center justify-content-center">
                        <p className="mb-0 me-2">No tienes Cuenta</p>
                        <button
                          onClick={irRegistro}
                          type="button"
                          className="btn-crear"
                        >
                          Crea Una
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
                      En nuestra compañia el criterio más importante es la
                      felicidad de nuestros apreciados usuarios y clientes, por
                      tal motivo nos esforzamos al máximo para lograr que estos
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

export default Login;
