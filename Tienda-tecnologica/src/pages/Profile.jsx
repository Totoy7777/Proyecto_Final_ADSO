import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <section
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          maxWidth: "480px",
          width: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: "2.5rem",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem" }}>Mi cuenta</h1>
        <p><strong>Nombre:</strong> {user?.nombre || ""}</p>
        <p><strong>Correo:</strong> {user?.email || ""}</p>
        <p><strong>Rol:</strong> {isAdmin ? "Administrador" : "Usuario"}</p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#007bff",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </section>
  );
};

export default Profile;
