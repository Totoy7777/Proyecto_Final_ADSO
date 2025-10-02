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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteState, setDeleteState] = useState({ loading: false, error: "", success: "" });

  useEffect(() => {
    if (!isAuthenticated || !isSuperAdmin || !authHeader) {
      setManagedUsers([]);
      return undefined;
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
  }, [isAuthenticated, isSuperAdmin, authHeader]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

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

  const handleDeleteRequest = () => {
    setDeleteState({ loading: false, error: "", success: "" });
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setDeleteState({ loading: false, error: "", success: "" });
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!user?.id) {
      setDeleteState({ loading: false, error: "No se encontró información del usuario.", success: "" });
      return;
    }

    setDeleteState({ loading: true, error: "", success: "" });

    try {
      const response = await fetch(`${API_BASE}/users/${user.id}`, {
        method: "DELETE",
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          ...NGROK_SKIP_HEADER,
        },
      });

      const payload = response.status === 204
        ? null
        : await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "No fue posible eliminar la cuenta.");
      }

      setDeleteState({
        loading: false,
        error: "",
        success: payload?.message || "Cuenta eliminada correctamente.",
      });
      setShowDeleteConfirm(false);
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      setDeleteState({
        loading: false,
        error: error.message || "No fue posible eliminar la cuenta.",
        success: "",
      });
    }
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

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
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

          <button
            type="button"
            onClick={handleDeleteRequest}
            disabled={deleteState.loading}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid #dc3545",
              backgroundColor: "#fff",
              color: deleteState.loading ? "#dc3545a0" : "#dc3545",
              fontWeight: 600,
              cursor: deleteState.loading ? "not-allowed" : "pointer",
              opacity: deleteState.loading ? 0.8 : 1,
            }}
          >
            Eliminar cuenta
          </button>
        </div>

        {showDeleteConfirm && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.5rem",
              borderRadius: "10px",
              border: "1px solid #f5c2c7",
              backgroundColor: "#fff5f5",
            }}
          >
            <h2 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              ¿Deseas eliminar tu cuenta?
            </h2>
            <p style={{ margin: "0 0 0.75rem 0", color: "#6c757d" }}>
              Esta acción eliminará tu cuenta, los artículos de tu carrito y cualquier otro registro asociado. No se puede deshacer.
            </p>
            {deleteState.error && (
              <div style={{ color: "#dc3545", marginBottom: "0.75rem" }}>{deleteState.error}</div>
            )}
            {deleteState.success && (
              <div style={{ color: "#198754", marginBottom: "0.75rem" }}>{deleteState.success}</div>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
              }}
            >
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteState.loading}
                style={{
                  padding: "0.65rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  fontWeight: 600,
                  cursor: deleteState.loading ? "wait" : "pointer",
                  opacity: deleteState.loading ? 0.8 : 1,
                }}
              >
                {deleteState.loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleteState.loading}
                style={{
                  padding: "0.65rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid #6c757d",
                  backgroundColor: "#fff",
                  color: "#6c757d",
                  fontWeight: 600,
                  cursor: deleteState.loading ? "not-allowed" : "pointer",
                  opacity: deleteState.loading ? 0.8 : 1,
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
