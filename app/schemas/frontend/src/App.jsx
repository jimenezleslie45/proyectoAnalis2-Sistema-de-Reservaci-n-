import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FaMicroscope,
  FaChartBar,
  FaTasks,
  FaFlask,
  FaUsers,
  FaCalendarAlt,
  FaFileAlt,
  FaCog,
  FaSignOutAlt,
  FaTools,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// --- Registro de Chart.js ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// --- Constantes de la API ---
const BASE_URL = "http://localhost:8000";
const API_RESERVAS_URL = `${BASE_URL}/reservations/`;
// --- ¡ESTA ES LA LÍNEA CORREGIDA! ---
const API_ANALYSIS_URL = `${BASE_URL}/reservations/analysis/popular-times`;
const API_TOKEN_URL = `${BASE_URL}/auth/token` ;

// ====================================================================
// --- COMPONENTES SIMULADOS (Placeholders) ---
// (Para que el código sea completo y funcional)
// ====================================================================

const Sidebar = ({
  collapsed,
  onToggle,
  onSelect,
  current,
  onLogout,
}) => {
  const sections = [
    { key: "panel", label: "Panel Principal", icon: <FaChartBar /> },
    { key: "reservas", label: "Reservas (API)", icon: <FaTasks /> },
    { key: "analisis", label: "Análisis (IA)", icon: <FaMicroscope /> },
    { key: "salas", label: "Laboratorios (Local)", icon: <FaFlask /> },
    { key: "equipos", label: "Equipos (Local)", icon: <FaTools /> },
    { key: "usuarios", label: "Usuarios (Local)", icon: <FaUsers /> },
    { key: "calendario", label: "Calendario", icon: <FaCalendarAlt /> },
    { key: "informes", label: "Reportes (API)", icon: <FaFileAlt /> },
    { key: "configuraciones", label: "Configuración", icon: <FaCog /> },
  ];

  return (
    <nav className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <h3 className="sidebar-title">{collapsed ? "Lab" : "LabManager"}</h3>
        <button onClick={onToggle} className="toggle-btn">
          {collapsed ? ">" : "<"}
        </button>
      </div>
      <ul className="sidebar-menu">
        {sections.map((s) => (
          <li
            key={s.key}
            className={`menu-item ${current === s.key ? "active" : ""}`}
            onClick={() => onSelect(s.key)}
            title={s.label}
          >
            {s.icon}
            {!collapsed && <span>{s.label}</span>}
          </li>
        ))}
      </ul>
      <div className="sidebar-footer">
        <div
          className={`menu-item logout-btn ${current === "logout" ? "active" : ""}`}
          onClick={onLogout}
          title="Cerrar Sesión"
        >
          <FaSignOutAlt />
          {!collapsed && <span>Cerrar Sesión</span>}
        </div>
      </div>
    </nav>
  );
};

const StatCard = ({ title, value }) => (
  <div className="stat-card panel-card">
    <div className="stat-value">{value}</div>
    <div className="stat-title">{title}</div>
  </div>
);

// ====================================================================
// --- COMPONENTE DE LOGIN (NUEVO) ---
// ====================================================================
const LoginScreen = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("admin"); // Valor por defecto para demo
  const [password, setPassword] = useState("admin123"); // Valor por defecto para demo
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // FastAPI espera los datos del token como 'application/x-www-form-urlencoded'
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    try {
      const res = await fetch(API_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (res.status === 401 || res.status === 400) {
        throw new Error("Usuario o contraseña incorrectos.");
      }
      if (!res.ok) {
        throw new Error(`Error en el servidor: ${res.statusText}`);
      }

      const data = await res.json();
      localStorage.setItem("authToken", data.access_token);
      onLoginSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <FaMicroscope size={48} className="login-icon" />
        <h2>LabManager</h2>
        <p className="muted">Inicia sesión para continuar</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ====================================================================
// --- COMPONENTES DE SECCIONES (Modificados y Originales) ---
// ====================================================================

// --- ModalForm (Local) ---
// (Tu código original, sin cambios)
const ModalForm = ({ show, onClose, onSubmit, type, data }) => {
  const [formData, setFormData] = useState({});

  const getInitialState = () => {
    if (data) return data;
    switch (type) {
      case "sala":
        return { nombre: "", capacidad: "", estado: "disponible" };
      case "equipo":
        return { nombre: "", tipo: "", estado: "disponible" };
      case "usuario":
        return { nombre: "", rol: "usuario", email: "" };
      default:
        return {};
    }
  };

  useEffect(() => {
    setFormData(getInitialState());
  }, [show, data, type]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const title = (data ? "Editar" : "Agregar") + " " + type;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          {type === "sala" && (
            <>
              <label>Nombre Sala:</label>
              <input
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleChange}
                required
              />
              <label>Capacidad:</label>
              <input
                name="capacidad"
                type="number"
                value={formData.capacidad || ""}
                onChange={handleChange}
                required
              />
              <label>Estado:</label>
              <select
                name="estado"
                value={formData.estado || "disponible"}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="ocupada">Ocupada</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </>
          )}

          {type === "equipo" && (
            <>
              <label>Nombre Equipo:</label>
              <input
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleChange}
                required
              />
              <label>Tipo:</label>
              <input
                name="tipo"
                value={formData.tipo || ""}
                onChange={handleChange}
                required
              />
              <label>Estado:</label>
              <select
                name="estado"
                value={formData.estado || "disponible"}
                onChange={handleChange}
              >
                <option value="disponible">Disponible</option>
                <option value="en uso">En Uso</option>
                <option value="mantenimiento">Mantenimiento</option>
              </select>
            </>
          )}

          {type === "usuario" && (
            <>
              <label>Nombre:</label>
              <input
                name="nombre"
                value={formData.nombre || ""}
                onChange={handleChange}
                required
              />
              <label>Email:</label>
              <input
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                required
              />
              <label>Rol:</label>
              <select
                name="rol"
                value={formData.rol || "usuario"}
                onChange={handleChange}
              >
                <option value="usuario">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ReservaModal (API - NUEVO) ---
// (Un modal específico para editar Reservas de la API)
const ReservaModal = ({ show, onClose, onSubmit, data }) => {
  const [formData, setFormData] = useState({
    lab_name: "",
    reserved_by: "",
    purpose: "",
    start_time: "",
    active: true,
  });

  useEffect(() => {
    if (data) {
      // Convertir la fecha ISO a formato datetime-local (YYYY-MM-DDTHH:MM)
      const localDate = new Date(data.start_time);
      // Ajustar por la zona horaria local para que se muestre correctamente
      const timezoneOffset = localDate.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(localDate.getTime() - timezoneOffset);
      const formattedDate = adjustedDate.toISOString().slice(0, 16);

      setFormData({
        lab_name: data.lab_name,
        reserved_by: data.reserved_by,
        purpose: data.purpose,
        start_time: formattedDate,
        active: data.active,
      });
    }
  }, [data]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Devolvemos el formato con la 'Z' (UTC) para la API
    onSubmit({
      ...formData,
      start_time: new Date(formData.start_time).toISOString(),
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Editar Reserva (API)</h3>
        <form onSubmit={handleSubmit} className="modal-form">
          <label>Nombre Lab:</label>
          <input
            name="lab_name"
            value={formData.lab_name || ""}
            onChange={handleChange}
            required
          />
          <label>Reservado Por:</label>
          <input
            name="reserved_by"
            value={formData.reserved_by || ""}
            onChange={handleChange}
            required
          />
          <label>Propósito:</label>
          <input
            name="purpose"
            value={formData.purpose || ""}
            onChange={handleChange}
            required
          />
          <label>Fecha y Hora Inicio:</label>
          <input
            name="start_time"
            type="datetime-local"
            value={formData.start_time || ""}
            onChange={handleChange}
            required
          />
          <div className="form-check-inline">
            <input
              name="active"
              type="checkbox"
              id="modalActive"
              checked={formData.active}
              onChange={handleChange}
            />
            <label htmlFor="modalActive">Activa</label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit">
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- LaboratoriosSection (Local) ---
// (Tu código original, sin cambios)
const LaboratoriosSection = () => {
  const [salas, setSalas] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem("salas")) || [];
    setSalas(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (formData) => {
    let data = JSON.parse(localStorage.getItem("salas")) || [];
    if (currentData) {
      data = data.map((item) =>
        item.id === currentData.id ? { ...item, ...formData } : item
      );
    } else {
      data.push({ ...formData, id: Date.now() });
    }
    localStorage.setItem("salas", JSON.stringify(data));
    setSalas(data);
    setModalOpen(false);
    setCurrentData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar?")) {
      let data = salas.filter((item) => item.id !== id);
      localStorage.setItem("salas", JSON.stringify(data));
      setSalas(data);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Gestión de Salas (Laboratorios)</h1>
      </header>
      <section className="panel-card">
        <button
          className="btn-add"
          onClick={() => {
            setCurrentData(null);
            setModalOpen(true);
          }}
        >
          Agregar Sala
        </button>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Capacidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {salas.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No hay salas registradas.
                </td>
              </tr>
            ) : (
              salas.map((s) => (
                <tr key={s.id}>
                  <td>{s.nombre}</td>
                  <td>{s.capacidad}</td>
                  <td>{s.estado}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setCurrentData(s);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(s.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <ModalForm
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        type="sala"
        data={currentData}
      />
    </>
  );
};

// --- EquiposSection (Local) ---
// (Tu código original, sin cambios)
const EquiposSection = () => {
  const [equipos, setEquipos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem("equipos")) || [];
    setEquipos(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (formData) => {
    let data = JSON.parse(localStorage.getItem("equipos")) || [];
    if (currentData) {
      data = data.map((item) =>
        item.id === currentData.id ? { ...item, ...formData } : item
      );
    } else {
      data.push({ ...formData, id: Date.now() });
    }
    localStorage.setItem("equipos", JSON.stringify(data));
    setEquipos(data);
    setModalOpen(false);
    setCurrentData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar?")) {
      let data = equipos.filter((item) => item.id !== id);
      localStorage.setItem("equipos", JSON.stringify(data));
      setEquipos(data);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Gestión de Equipos</h1>
      </header>
      <section className="panel-card">
        <button
          className="btn-add"
          onClick={() => {
            setCurrentData(null);
            setModalOpen(true);
          }}
        >
          Agregar Equipo
        </button>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {equipos.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No hay equipos registrados.
                </td>
              </tr>
            ) : (
              equipos.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.tipo}</td>
                  <td>{e.estado}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setCurrentData(e);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(e.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <ModalForm
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        type="equipo"
        data={currentData}
      />
    </>
  );
};

// --- UsuariosSection (Local) ---
// (Tu código original, sin cambios)
const UsuariosSection = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem("usuarios")) || [];
    setUsuarios(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = (formData) => {
    let data = JSON.parse(localStorage.getItem("usuarios")) || [];
    if (currentData) {
      data = data.map((item) =>
        item.id === currentData.id ? { ...item, ...formData } : item
      );
    } else {
      data.push({ ...formData, id: Date.now() });
    }
    localStorage.setItem("usuarios", JSON.stringify(data));
    setUsuarios(data);
    setModalOpen(false);
    setCurrentData(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que quieres eliminar?")) {
      let data = usuarios.filter((item) => item.id !== id);
      localStorage.setItem("usuarios", JSON.stringify(data));
      setUsuarios(data);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>Gestión de Usuarios</h1>
      </header>
      <section className="panel-card">
        <button
          className="btn-add"
          onClick={() => {
            setCurrentData(null);
            setModalOpen(true);
          }}
        >
          Agregar Usuario
        </button>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.rol}</td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => {
                        setCurrentData(u);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(u.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
      <ModalForm
        show={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        type="usuario"
        data={currentData}
      />
    </>
  );
};

// --- ReportesSection (MODIFICADA - API) ---
// (Modificada para usar datos de la API recibidos por props)
const ReportesSection = ({ reservasApi }) => {
  // Ya no usa 'reservas' de localStorage, usa 'reservasApi' de las props
  return (
    <>
      <header className="page-header">
        <h1>Reportes (Informes)</h1>
      </header>
      <section className="panel-card">
        <div className="panel-title">Historial de Reservas (Datos de API)</div>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Laboratorio</th>
              <th>Reservado Por</th>
              <th>Propósito</th>
              <th>Fecha Inicio</th>
              <th>Activa</th>
            </tr>
          </thead>
          <tbody>
            {reservasApi.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
                  No hay historial de reservas en la API.
                </td>
              </tr>
            ) : (
              reservasApi.map((r) => (
                <tr key={r.id}>
                  <td>{r.lab_name}</td>
                  <td>{r.reserved_by}</td>
                  <td>{r.purpose}</td>
                  <td>{new Date(r.start_time).toLocaleString("es-GT")}</td>
                  <td>{r.active ? "Sí" : "No"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};

// --- CalendarioSection (Local) ---
// (Tu código original, sin cambios)
const CalendarioSection = () => {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const emptyDays = Array(2).fill(null);
  const monthDays = Array(31)
    .fill(null)
    .map((_, i) => i + 1);

  return (
    <>
      <header className="page-header">
        <h1>Calendario de Reservas</h1>
      </header>
      <section className="panel-card">
        <div className="panel-title">Mes Actual</div>
        <div className="calendar">
          {days.map((day) => (
            <div key={day} className="calendar-header">
              {day}
            </div>
          ))}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          ))}
          {monthDays.map((day) => (
            <div key={day} className="calendar-day">
              {day}
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

// --- ConfiguracionSection (Local) ---
// (Tu código original, sin cambios)
const ConfiguracionSection = () => {
  const [config, setConfig] = useState({
    labName: "Laboratorio Central",
    openTime: "08:00",
    closeTime: "18:00",
  });

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("config"));
    if (data) {
      setConfig(data);
    }
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("config", JSON.stringify(config));
    alert("Configuración guardada");
  };

  return (
    <>
      <header className="page-header">
        <h1>Configuración del Sistema</h1>
      </header>
      <section className="panel-card">
        <div className="panel-title">Ajustes Generales</div>
        <form onSubmit={handleSubmit} className="config-form">
          <label htmlFor="labName">Nombre del Laboratorio:</label>
          <input
            type="text"
            id="labName"
            name="labName"
            value={config.labName}
            onChange={handleChange}
          />
          <label htmlFor="openTime">Hora de Apertura:</label>
          <input
            type="time"
            id="openTime"
            name="openTime"
            value={config.openTime}
            onChange={handleChange}
          />
          <label htmlFor="closeTime">Hora de Cierre:</label>
          <input
            type="time"
            id="closeTime"
            name="closeTime"
            value={config.closeTime}
            onChange={handleChange}
          />
          <button type="submit">Guardar Cambios</button>
        </form>
      </section>
    </>
  );
};

// --- AnalisisSection (NUEVA - API) ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const AnalisisSection = ({ onUnauthorized }) => {
  const [popularTimes, setPopularTimes] = useState(null);
  const [popularLabs, setPopularLabs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Funciones para formatear datos para Chart.js
  const formatDataForBarChart = (data) => {
    if (!data || data.length === 0) return null;
    // Ordenar por hora
    const sortedData = data.sort((a, b) => a.hour - b.hour);
    const labels = sortedData.map((item) => `${item.hour}:00h`);
    const values = sortedData.map((item) => item.count);
    return {
      labels,
      datasets: [
        {
          label: "Número de Reservas",
          data: values,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
      ],
    };
  };

  const formatDataForPieChart = (data) => {
    if (!data || data.length === 0) return null;
    const labels = data.map((item) => item.lab_name);
    const values = data.map((item) => item.count);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
        },
      ],
    };
  };

  useEffect(() => {
    const cargarAnalisis = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          onUnauthorized();
          return;
        }

        const res = await fetch(API_ANALYSIS_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          onUnauthorized();
          return;
        }
        if (!res.ok)
          throw new Error(`Error al obtener análisis: ${res.status}`);

        const data = await res.json();
        setPopularTimes(formatDataForBarChart(data.popular_hours));
        setPopularLabs(formatDataForPieChart(data.popular_labs));
      } catch (e) {
        console.error(e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    cargarAnalisis();
  }, [onUnauthorized]);

  if (loading) {
    return (
      <section className="panel-card">
        <div className="empty">Cargando análisis...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel-card">
        <div className="empty" style={{ color: "red" }}>
          Error: {error}
        </div>
      </section>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1>Análisis de Popularidad (IA)</h1>
      </header>
      <section className="charts-grid">
        <div className="panel-card">
          <div className="panel-title">Horarios Más Populares</div>
          <div className="chart-container">
            {popularTimes ? (
              <Bar options={chartOptions} data={popularTimes} />
            ) : (
              <div className="empty">No hay datos de horarios.</div>
            )}
          </div>
        </div>
        <div className="panel-card">
          <div className="panel-title">Laboratorios Más Usados</div>
          <div className="chart-container">
            {popularLabs ? (
              <Pie options={chartOptions} data={popularLabs} />
            ) : (
              <div className="empty">No hay datos de laboratorios.</div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};
// --- Sugerencia IA (Chat con OpenAI) ---
const AISugerencia = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // URL del endpoint de FastAPI (tu backend)
  const API_URL = "http://localhost:8000/chat-ia";

  // Función que se ejecuta al presionar "Preguntar"
  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResponse("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      if (!res.ok) throw new Error(`Error del servidor (${res.status})`);

      const data = await res.json();
      setResponse(data.answer || "No se recibió respuesta del modelo IA.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <h1>💡 Sugerencia Inteligente (IA)</h1>
        <p className="muted">
          Escribe una pregunta sobre tus reservas o laboratorios y obtén una respuesta generada por IA.
        </p>
      </header>

      <section className="panel-card">
        <form onSubmit={handleAsk} className="ia-form">
          <input
            type="text"
            className="ia-input"
            placeholder="Ejemplo: ¿Cuál laboratorio tiene más reservas?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Consultando..." : "Preguntar"}
          </button>
        </form>

        {error && <p className="error-message">⚠️ {error}</p>}

        {response && (
          <div className="ia-response">
            <h3>💬 Respuesta de la IA:</h3>
            <p>{response}</p>
          </div>
        )}
      </section>
    </>
  );
};

// ====================================================================
// --- COMPONENTE PRINCIPAL DE LA APP ---
// ====================================================================
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState("panel");
  const [reservas, setReservas] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("authToken")
  );

  // --- Estado para el formulario de CREAR reserva
  const [formReserva, setFormReserva] = useState({
    lab_name: "",
    reserved_by: "",
    purpose: "",
    start_time: "", // Formato: YYYY-MM-DDTHH:MM
    active: true,
  });

  // --- Estado para el modal de ACTUALIZAR reserva
  const [modalReservaOpen, setModalReservaOpen] = useState(false);
  const [currentReserva, setCurrentReserva] = useState(null);

  // --- Funciones de Autenticación y Helpers ---
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setSection("panel");
    cargarReservas(); // Cargar datos después de iniciar sesión
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
    setReservas([]); // Limpiar datos al cerrar sesión
  };

  const getToken = () => localStorage.getItem("authToken");

  const getAuthHeaders = (includeContentType = true) => {
    const headers = {
      Authorization: `Bearer ${getToken()}`,
    };
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  };

  // --- Funciones CRUD (API) ---

  // READ
  const cargarReservas = async () => {
    const token = getToken();
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const res = await fetch(API_RESERVAS_URL, {
        headers: getAuthHeaders(false),
      });
      if (res.status === 401) {
        console.error("Token no válido o expirado.");
        handleLogout();
        return;
      }
      if (!res.ok) throw new Error(`Error al obtener reservas: ${res.status}`);
      const data = await res.json();
      setReservas(data);
    } catch (e) {
      console.error(e);
      setReservas([]);
    }
  };

  // CREATE
  const agregarReserva = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      handleLogout();
      return;
    }

    const payload = {
      ...formReserva,
      // Asegurarse de enviar la fecha en formato ISO (UTC)
      start_time: new Date(formReserva.start_time).toISOString(),
    };

    try {
      const res = await fetch(API_RESERVAS_URL, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        console.error("Error al crear reserva (Backend):", res.status, errData.detail);
        alert(`Error ${res.status}: ${errData.detail || "Error desconocido"}`);
        return;
      }

      setFormReserva({
        lab_name: "",
        reserved_by: "",
        purpose: "",
        start_time: "",
        active: true,
      });
      await cargarReservas(); // Recargamos la lista
    } catch (e) {
      console.error("Error en el fetch:", e);
    }
  };

  // UPDATE
  const actualizarReserva = async (formData) => {
    const token = getToken();
    if (!token || !currentReserva) {
      handleLogout();
      return;
    }

    try {
      const res = await fetch(`${API_RESERVAS_URL}/${currentReserva.id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(formData), // formData ya debe estar en el formato correcto
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al actualizar");
      }

      setModalReservaOpen(false);
      setCurrentReserva(null);
      await cargarReservas();
    } catch (e) {
      console.error("Error al actualizar reserva:", e);
      alert(`Error: ${e.message}`);
    }
  };

  // DELETE
  const eliminarReserva = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta reserva?")) {
      return;
    }
    const token = getToken();
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const res = await fetch(`${API_RESERVAS_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(false),
      });

      if (res.status === 401) {
        handleLogout();
        return;
      }
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Error al eliminar");
      }

      await cargarReservas();
    } catch (e) {
      console.error("Error al eliminar reserva:", e);
      alert(`Error: ${e.message}`);
    }
  };

  // --- Handlers para el Modal de Edición ---
  const handleEditClick = (reserva) => {
    setCurrentReserva(reserva);
    setModalReservaOpen(true);
  };

  const handleCloseModal = () => {
    setModalReservaOpen(false);
    setCurrentReserva(null);
  };

  // --- Carga inicial de datos ---
  useEffect(() => {
    if (isAuthenticated) {
      cargarReservas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Solo se ejecuta cuando cambia el estado de autenticación

  // --- Datos para Gráficos del Panel (Datos Ficticios) ---
  // (Estos podrían ser reemplazados por una llamada a la API si existiera un endpoint /stats)
  const statsData = useMemo(() => {
    return {
      barData: {
        labels: ["Lab A", "Lab B", "Lab C", "Lab D", "Lab E"],
        datasets: [
          {
            label: "Horas Reservadas (Mes)",
            data: [65, 59, 80, 81, 56],
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
        ],
      },
      pieData: {
        labels: ["Disponibles", "En Uso", "Mantenimiento"],
        datasets: [
          {
            data: [12, 5, 2],
            backgroundColor: [
              "rgba(75, 192, 192, 0.6)",
              "rgba(255, 99, 132, 0.6)",
              "rgba(255, 206, 86, 0.6)",
            ],
          },
        ],
      },
    };
  }, []);

  // --- Renderizado Condicional del Contenido ---
  const renderContent = () => {
    if (section === "panel") {
      return (
        <>
          <header className="page-header">
            <h1>Sistema de reservas de laboratorio</h1>
            <p className="muted">Resumen del sistema de reservas</p>
          </header>
          <section className="stats-grid">
            <StatCard
              title="Reservas Activas (API)"
              value={reservas.filter((r) => r.active).length}
            />
            <StatCard title="Laboratorios (Local)" value="5" />
            <StatCard title="Equipos Disponibles (Local)" value="12" />
            <StatCard title="Usuarios (Local)" value="8" />
          </section>
          <section className="charts-grid">
            <div className="panel-card">
              <div className="panel-title">Reservas por Laboratorio (Demo)</div>
              <div className="chart-container">
                <Bar options={chartOptions} data={statsData.barData} />
              </div>
            </div>
            <div className="panel-card">
              <div className="panel-title">Estado de Equipos (Demo)</div>
              <div className="chart-container">
                <Pie options={chartOptions} data={statsData.pieData} />
              </div>
            </div>
          </section>
        </>
      );
    }

    // --- SECCIÓN CRUD API (MODIFICADA) ---
    if (section === "reservas") {
      return (
        <>
          <header className="page-header">
            <h1>Reservas</h1>
            <p className="muted">Crear y listar reservas (API FastAPI)</p>
          </header>
          <section className="panel-card mb-3">
            <div className="panel-title">Nueva reserva</div>

            <form className="row g-3" onSubmit={agregarReserva}>
              <div className="col-md-6">
                <label htmlFor="formLabName" className="form-label">
                  Nombre del Lab
                </label>
                <input
                  id="formLabName"
                  className="form-control"
                  placeholder="Ej: Lab de Biología Molecular"
                  value={formReserva.lab_name}
                  onChange={(e) =>
                    setFormReserva({ ...formReserva, lab_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="formPurpose" className="form-label">
                  Propósito
                </label>
                <input
                  id="formPurpose"
                  className="form-control"
                  placeholder="Ej: Secuenciación de ADN"
                  value={formReserva.purpose}
                  onChange={(e) =>
                    setFormReserva({ ...formReserva, purpose: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-md-5 mt-3">
                <label htmlFor="formReservedBy" className="form-label">
                  Reservado Por
                </label>
                <input
                  id="formReservedBy"
                  className="form-control"
                  placeholder="Ej: Dr. Juan Pérez"
                  value={formReserva.reserved_by}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      reserved_by: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="col-md-4 mt-3">
                <label htmlFor="formStartTime" className="form-label">
                  Fecha y Hora de Inicio
                </label>
                <input
                  id="formStartTime"
                  type="datetime-local"
                  className="form-control"
                  value={formReserva.start_time}
                  onChange={(e) =>
                    setFormReserva({
                      ...formReserva,
                      start_time: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="col-md-1 mt-3 d-flex align-items-end justify-content-center">
                <div className="form-check">
                  <input
                    id="formActive"
                    type="checkbox"
                    className="form-check-input"
                    checked={formReserva.active}
                    onChange={(e) =>
                      setFormReserva({
                        ...formReserva,
                        active: e.target.checked,
                      })
                    }
                  />
                  <label htmlFor="formActive" className="form-check-label">
                    Activa
                  </label>
                </div>
              </div>

              <div className="col-md-2 mt-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">
                  Guardar
                </button>
              </div>
            </form>
          </section>

          <section className="panel-card">
            <div className="panel-title">Reservas registradas</div>
            <table className="table table-striped align-middle table-responsive">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Laboratorio</th>
                  <th>Reservado Por</th>
                  <th>Propósito</th>
                  <th>Inicio</th>
                  <th>Activa</th>
                  {/* <th>Creado en</th> */}
                  {/* <th>Owner ID</th> */}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservas.length === 0 ? (
                  // --- CORRECCIÓN VISUAL ---
                  <tr>
                    <td colSpan="8" className="empty">
                      No hay reservas registradas en la API.
                    </td>
                  </tr>
                ) : (
                  reservas.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.lab_name}</td>
                      <td>{r.reserved_by}</td>
                      <td>{r.purpose}</td>
                      <td>{new Date(r.start_time).toLocaleString("es-GT")}</td>
                      <td>{r.active ? "Sí" : "No"}</td>
                      {/* <td>{new Date(r.created_at).toLocaleString('es-GT')}</td> */}
                      {/* <td>{r.owner_id}</td> */}
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => handleEditClick(r)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => eliminarReserva(r.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      );
    }

    if (section === "analisis") {
      return <AnalisisSection onUnauthorized={handleLogout} />;
    }
    if (section === "ia") {
  return <AISugerencia />;
}

    if (section === "salas") {
      return <LaboratoriosSection />;
    }
    if (section === "equipos") {
      return <EquiposSection />;
    }
    if (section === "usuarios") {
      return <UsuariosSection />;
    }
    if (section === "informes") {
      // Pasamos las reservas de la API como prop
      return <ReportesSection reservasApi={reservas} />;
    }
    if (section === "calendario") {
      return <CalendarioSection />;
    }
    if (section === "configuraciones") {
      return <ConfiguracionSection />;
    }

    return (
      <div className="panel-card">
        <div className="panel-title">Sección: {section}</div>
        <p className="muted">Contenido próximamente.</p>
      </div>
    );
  };

  // --- Renderizado Principal (Login o App) ---
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="layout">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        onSelect={(s) => setSection(s)}
        current={section}
        onLogout={handleLogout}
      />
      <main className="content">
        <motion.div
          className="corner-icon"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          title="Laboratorio"
        >
          <FaMicroscope size={36} />
        </motion.div>
        {renderContent()}
      </main>

      {/* Modal para Editar Reservas de la API */}
      <ReservaModal
        show={modalReservaOpen}
        onClose={handleCloseModal}
        onSubmit={actualizarReserva}
        data={currentReserva}
      />
    </div>
  );
}