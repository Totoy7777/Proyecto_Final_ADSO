import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const navegacion = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    pass: "",
    confirmPass: "",
  });

  const irLogin = () => {
  navegacion("/login");
};


  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const { nombre, email, pass, confirmPass } = formData;

  if (!nombre || !email || !pass || !confirmPass) {
    setError("⚠️ Todos los campos son obligatorios.");
    return;
  }

  if (pass !== confirmPass) {
    setError("❌ Las contraseñas no coinciden.");
    return;
  }

  try {
    const response = await axios.post("http://localhost:8080/api/users/register", {
      nombre: formData.nombre,
      email: formData.email,
      passwordHash: formData.pass, // 👈 igual que en tu entidad User
      direccion: "",               // opcional
      telefono: ""                 // opcional
    });

    alert("✅ Registro exitoso");
    console.log(response.data);
    navegacion("/login");
  } catch (err) {
    console.error(err);
    setError("❌ Error al registrar usuario.");
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
                        src={logo}
                        style={{ width: "180px" }}
                        alt="logo"
                        className="mb-3"
                      />
                    </div>

                    <form onSubmit={handleSubmit}>
                      <p className="text-muted">Completa para registrarte</p>

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

                      {/* Email */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="email">
                          Correo electrónico
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="ejemplo@mail.com"
                          required
                        />
                      </div>

                      {/* Contraseña */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="pass">
                          Contraseña
                        </label>
                        <input
                          type="password"
                          id="pass"
                          value={formData.pass}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Ingresa contraseña"
                          required
                        />
                      </div>

                      {/* Confirmar Contraseña */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="confirmPass">
                          Confirmar Contraseña
                        </label>
                        <input
                          type="password"
                          id="confirmPass"
                          value={formData.confirmPass}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Confirma tu contraseña"
                          required
                        />
                      </div>

                      {/* Mensaje de error */}
                      {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                      )}

                      {/* Botón registro */}
                      <div className="text-center pt-1 mb-4">
                        <button
                          className="btn btn-lg w-100 text-white gradient-btn shadow-sm mb-3"
                          type="submit"
                        >
                          Registrar
                        </button>
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <p className="mb-0 me-2">¿Ya tienes una cuenta?</p>
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
                    <h4 className="fw-bold mb-4">Acerca de nuestra compañía</h4>
                    <p className="small">
                      En nuestra compañía, lo más importante es la felicidad de
                      nuestros usuarios. Nos esforzamos al máximo para que tengan
                      una buena experiencia y se vayan felices.
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
