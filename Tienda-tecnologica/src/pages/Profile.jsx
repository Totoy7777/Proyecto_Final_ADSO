import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE, NGROK_SKIP_HEADER } from "../api/axios";

const Profile = () => {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, authHeader, logout } = useAuth();
  const navigate = useNavigate();

  const [managedUsers, setManagedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersFeedback, setUsersFeedback] = useState({ error: "", success: "" });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    if (!isSuperAdmin || !authHeader) {
      setManagedUsers([]);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersFeedback({ error: "", success: "" });
      try {
        const response = await fetch(`${API_BASE}/super-admin/users`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
            ...NGROK_SKIP_HEADER,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.message || "No fue posible cargar los usuarios");
        }

        const data = await response.json();
        if (isMounted) {
          setManagedUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          const message = error.name === "AbortError" ? "" : error.message;
          setUsersFeedback({ error: message || "", success: "" });
        }
      } finally {
        if (isMounted) {
          setUsersLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isSuperAdmin, authHeader]);

  const handleToggleAdmin = async (targetUserId, currentAdmin) => {
    if (!authHeader) {
      setUsersFeedback({ error: "No hay credenciales válidas para esta acción.", success: "" });
      return;
    }

    const nextAdmin = !currentAdmin;
    setActionLoadingId(targetUserId);
    setUsersFeedback({ error: "", success: "" });

    try {
      const response = await fetch(`${API_BASE}/super-admin/users/${targetUserId}/admin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
          ...NGROK_SKIP_HEADER,
        },
        body: JSON.stringify({ admin: nextAdmin }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "No fue posible actualizar el rol");
      }

      setManagedUsers((prev) =>
        prev.map((managedUser) =>
          managedUser.userId === targetUserId
            ? { ...managedUser, admin: nextAdmin }
            : managedUser
        )
      );
      setUsersFeedback({ error: "", success: data?.message || "Rol actualizado" });
    } catch (error) {
      setUsersFeedback({ error: error.message || "No fue posible actualizar el rol", success: "" });
    } finally {
      setActionLoadingId(null);
    }
  };

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
          maxWidth: "640px",
          width: "100%",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          padding: "2.5rem",
        }}
      >
        <h1 style={{ marginBottom: "1.5rem" }}>Mi cuenta</h1>
        <p>
          <strong>Nombre:</strong> {user?.nombre || ""}
        </p>
        <p>
          <strong>Correo:</strong> {user?.email || ""}
        </p>
        <p>
          <strong>Rol:</strong> {isSuperAdmin ? "Super administrador" : isAdmin ? "Administrador" : "Usuario"}
        </p>

        {isSuperAdmin && (
          <div style={{ marginTop: "2rem" }}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
              Gestión de administradores
            </h2>
            {usersFeedback.error && (
              <div style={{ color: "#dc3545", marginBottom: "0.75rem" }}>
                {usersFeedback.error}
              </div>
            )}
            {usersFeedback.success && (
              <div style={{ color: "#198754", marginBottom: "0.75rem" }}>
                {usersFeedback.success}
              </div>
            )}
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                padding: "1rem",
                maxHeight: "260px",
                overflowY: "auto",
                backgroundColor: "#f8f9fa",
              }}
            >
              {usersLoading ? (
                <p style={{ margin: 0 }}>Cargando usuarios…</p>
              ) : managedUsers.length === 0 ? (
                <p style={{ margin: 0 }}>No hay usuarios para gestionar.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>Nombre</th>
                      <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>Correo</th>
                      <th style={{ textAlign: "center", paddingBottom: "0.5rem" }}>Administrador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managedUsers.map((managedUser) => {
                      const isTargetSuper = managedUser.superAdmin;
                      const disableToggle = isTargetSuper || managedUser.userId === user?.id;
                      return (
                        <tr key={managedUser.userId}>
                          <td style={{ padding: "0.4rem 0" }}>{managedUser.nombre}</td>
                          <td style={{ padding: "0.4rem 0" }}>{managedUser.email}</td>
                          <td style={{ padding: "0.4rem 0", textAlign: "center" }}>
                            <button
                              type="button"
                              onClick={() => handleToggleAdmin(managedUser.userId, managedUser.admin)}
                              disabled={disableToggle || actionLoadingId === managedUser.userId}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border: "1px solid transparent",
                                backgroundColor: managedUser.admin ? "#198754" : "#6c757d",
                                color: "#fff",
                                cursor: disableToggle ? "not-allowed" : "pointer",
                                opacity: actionLoadingId === managedUser.userId ? 0.7 : 1,
                              }}
                              aria-label={
                                managedUser.admin
                                  ? "Revocar permisos de administrador"
                                  : "Conceder permisos de administrador"
                              }
                            >
                              {disableToggle
                                ? isTargetSuper
                                  ? "Super admin"
                                  : "Tú"
                                : actionLoadingId === managedUser.userId
                                  ? "Guardando..."
                                  : managedUser.admin
                                    ? "Revocar"
                                    : "Conceder"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

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
