import React, { useState } from "react";
import "../Css/Registro.css";
import logo from "../assets/logo.png"
import "bootstrap/dist/css/bootstrap.min.css"; // aseguramos importar bootstrap
import { useNavigate } from "react-router-dom";

const Registro = () => {
  const navegacion = useNavigate();

  const irLogin = () => {
    navegacion("/Login");
  };

  const [formData, setFormData] = useState({
    nombre: "",
    tipoDoc: "",
    numeroDoc: "",
    pass: "",
    confirmPass: "",
  });

  const [error,setError]=useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre, tipoDoc, numeroDoc, pass, confirmPass } = formData;

    if (!nombre || !tipoDoc || !numeroDoc || !pass || !confirmPass) {
      setError("⚠️ Todos los campos son obligatorios.");
      return;
    }

    // ✅ Validar que el número de documento solo tenga números
    if (!/^\d+$/.test(numeroDoc)) {
      setError("❌ El número de documento solo debe contener números.");
      return;
    }

     // ✅ Validar contraseña con regex
    const regexPass = /^(?=.*[A-Z])(?=.*[$%&/_-]).{6,}$/;
    if (!regexPass.test(pass)) {
      setError(
        "❌ La contraseña debe tener mínimo 6 caracteres, al menos una mayúscula y un símbolo"
      );
      return;
    }

    if (pass !== confirmPass) {
      setError("❌ Las contraseñas no coinciden.");
      return;
    }
    try{
      const response = await fetch("http://localhost:8080/api/registro",{
        method:"POST",
        headers:{
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre,tipoDoc,numeroDoc,password:pass,
        }),
      });

      if (response.ok) {
        const data = await response.text();
        alert("✅ "+data);
        navegacion("/Login");
      }else{
        alert("Error en el registro.")
      }
    } catch(error){
      console.error("Error: ",error);
      setError(" No se pudo conectar con el servido.");
    }

    alert("✅ Registro exitoso");
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
                      <h4 className="fw-bold"></h4>
                    </div>

                    {/* Aquí el form con handleSubmit */}
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
                          placeholder="Ingresa Contraseña"
                          required
                        />
                      </div>

                      {/* Confirmar Contraseña */}
                      <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="confirmPass">
                          Confirma Contraseña
                        </label>
                        <input
                          type="password"
                          id="confirmPass"
                          value={formData.confirmPass}
                          onChange={handleChange}
                          className="form-control form-control-lg"
                          placeholder="Confirma Contraseña"
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
