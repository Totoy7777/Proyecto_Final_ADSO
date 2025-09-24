import React, { useState } from "react";
import "../Css/login.css";
import logo from "../assets/logo.png";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const goToRegister = () => {
    navigate("/Registro");
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("El formato del correo es invalido.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Usuario o contrasena incorrectos.");
          return;
        }
        throw new Error(`Error HTTP ${response.status}`);
      }

      const user = await response.json();
      console.log("Usuario autenticado", user);
      navigate("/");
    } catch (submitError) {
      console.error("Error en el login", submitError);
      setError("Error en la conexion con el servidor.");
    }
  };

  return (
    <section className="gradient-form">
      <div className="container py-5 h-100">
        <div className="row d-flex justify-content-center align-items-center h-100">
          <div className="col-xl-10">
            <div className="card shadow-lg border-0 rounded-4 text-black overflow-hidden">
              <div className="row g-0">
                <div className="col-lg-6 bg-white">
                  <div className="card-body p-md-5 mx-md-4">
                    <div className="text-center mb-4">
                      <img src={logo} style={{ width: "180px" }} alt="logo" className="mb-3" />
                      <h4 className="fw-bold"></h4>
                    </div>

                    <form onSubmit={handleSubmit}>
                      <p className="text-muted"></p>

                      {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                      )}

                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="loginEmail">
                          Correo electronico
                        </label>
                        <input
                          type="email"
                          id="loginEmail"
                          className="form-control form-control-lg"
                          placeholder="correo@ejemplo.com"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="loginPassword">
                          Contrasena
                        </label>
                        <input
                          type="password"
                          id="loginPassword"
                          className="form-control form-control-lg"
                          placeholder="Ingrese su contrasena"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="text-center pt-1 mb-4">
                        <button className="btn btn-lg w-100 text-white gradient-btn shadow-sm mb-3" type="submit">
                          Ingresar
                        </button>
                      </div>

                      <div className="d-flex align-items-center justify-content-center">
                        <p className="mb-0 me-2">No tienes cuenta?</p>
                        <button onClick={goToRegister} type="button" className="btn-crear">
                          Crea una
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                <div className="col-lg-6 d-flex align-items-center gradient-custom-2 text-white">
                  <div className="px-4 py-5 mx-md-4">
                    <h4 className="fw-bold mb-4">Acerca De Nuestra Compania</h4>
                    <p className="small">
                      En nuestra compania el criterio mas importante es la felicidad de nuestros apreciados usuarios y clientes, por tal motivo nos esforzamos al maximo para lograr que estos tengan una buena experiencia con nosotros y se vayan felices a sus hogares.
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



