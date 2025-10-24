import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaMicroscope } from "react-icons/fa";
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

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const barData = {
  labels: ["Lab A", "Lab B", "Lab C", "Lab D", "Lab E"],
  datasets: [
    {
      label: "Horas Reservadas (Mes)",
      data: [65, 59, 80, 81, 56],
      backgroundColor: "rgba(54, 162, 235, 0.6)",
    },
  ],
};

const pieData = {
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
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};

const API_URL = "http://localhost:8000/reservations/";

// --- (Aquí van tus otros componentes como ModalForm, etc. No los modificamos) ---
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
const ReportesSection = () => {
  const [reportes, setReportes] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("reservas")) || [];
    setReportes(data);
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Reportes (Informes)</h1>
      </header>
      <section className="panel-card">
        <div className="panel-title">Historial de Reservas (localStorage)</div>
        <table className="table table-striped align-middle">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Recurso</th>
              <th>Fecha</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {reportes.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty">
                  No hay historial de reservas.
                </td>
              </tr>
            ) : (
              reportes.map((r) => (
                <tr key={r.id}>
                  <td>{r.usuario}</td>
                  <td>{r.recurso}</td>
                  <td>{r.fecha}</td>
                  <td>{r.hora}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </>
  );
};
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


// --- COMPONENTE PRINCIPAL DE LA APP ---
export default function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [section, setSection] = useState("panel");

  const [reservas, setReservas] = useState([]);
  
  // --- ¡ESTADO MODIFICADO! ---
  // El estado del formulario ahora coincide con tu API de Python
  const [formReserva, setFormReserva] = useState({
    lab_name: "",
    reserved_by: "",
    purpose: "",
    start_time: "", // Formato: YYYY-MM-DDTHH:MM
    active: true,
  });

  
  // --- ¡¡¡AQUÍ DEBES PEGAR TU TOKEN!!! ---
  // 1. Ve a Swagger (http://localhost:8000/docs)
  // 2. Crea un usuario en POST /auth/register
  // 3. Copia el 'access_token' y pégalo aquí abajo
  const TOKEN_FIJO = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlamVjdXRpdm9fbGFiIiwiZXhwIjoxNzYxMTk3NzA3fQ.j9TCjlNILyJSfLKR8PJZ8pXung1d_14nIwgRXt4CMPs";

  const cargarReservas = async () => {
    if (!TOKEN_FIJO || TOKEN_FIJO.startsWith("PEGA-AQUI")) {
      console.error("TOKEN FALTANTE: Pega un token nuevo en la variable TOKEN_FIJO.");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        headers: {
          "Authorization": `Bearer ${TOKEN_FIJO}`
        }
      });
      if (res.status === 401) {
        console.error("Token no válido o expirado. Genera uno nuevo en /docs y pégalo en el código.");
        setReservas([]);
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

  // --- ¡FUNCIÓN MODIFICADA! ---
  const agregarReserva = async (e) => {
    e.preventDefault();
    
    if (!TOKEN_FIJO || TOKEN_FIJO.startsWith("PEGA-AQUI")) {
        console.error("TOKEN FALTANTE: Pega un token nuevo en la variable TOKEN_FIJO.");
        return;
    }

    // El payload ahora coincide con la nueva estructura
    const payload = {
      lab_name: formReserva.lab_name,
      reserved_by: formReserva.reserved_by,
      purpose: formReserva.purpose,
      start_time: formReserva.start_time, // El input datetime-local ya da el formato correcto
      active: formReserva.active,
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN_FIJO}`
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
          const errData = await res.json();
          console.error("Error al crear reserva (Backend):", res.status, errData.detail);
          alert(`Error ${res.status}: ${errData.detail}`);
          return;
      }
      
      // Reseteamos el formulario al estado inicial modificado
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

  useEffect(() => {
    cargarReservas();
  }, []);

  const renderContent = () => {
     if (section === "panel") {
      return (
        <>
        <header className="page-header">
          <h1>Panel General</h1>
          <p className="muted">Resumen del sistema de reservas</p>
        </header>
        <section className="stats-grid">
          <StatCard
            title="Reservas Activas"
            value={reservas.filter((r) => r.active).length} // Actualizado para usar 'active'
          />
          <StatCard title="Laboratorios" value="5" />
          <StatCard title="Equipos Disponibles" value="12" />
          <StatCard title="Usuarios Registrados" value="8" />
        </section>
        <section className="charts-grid">
          <div className="panel-card">
            <div className="panel-title">Reservas por Laboratorio</div>
            <div className="chart-container">
              <Bar options={chartOptions} data={barData} />
            </div>
          </div>
          <div className="panel-card">
            <div className="panel-title">Estado de Equipos</div>
            <div className="chart-container">
              <Pie options={chartOptions} data={pieData} />
            </div>
          </div>
        </section>
      </>
      );
    }

    // --- ¡SECCIÓN MODIFICADA! ---
    if (section === "reservas") {
      return (
        <>
          <header className="page-header">
            <h1>Reservas</h1>
            <p className="muted">Crear y listar reservas (API FastAPI)</p>
          </header>
          <section className="panel-card mb-3">
            <div className="panel-title">Nueva reserva</div>
            
            {/* --- ¡FORMULARIO MODIFICADO! --- */}
            <form className="row g-3" onSubmit={agregarReserva}>
              <div className="col-md-6">
                <label htmlFor="formLabName" className="form-label">Nombre del Lab</label>
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
                <label htmlFor="formPurpose" className="form-label">Propósito</label>
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
                 <label htmlFor="formReservedBy" className="form-label">Reservado Por</label>
                 <input
                   id="formReservedBy"
                   className="form-control"
                   placeholder="Ej: Dr. Juan Pérez"
                   value={formReserva.reserved_by}
                   onChange={(e) =>
                     setFormReserva({ ...formReserva, reserved_by: e.target.value })
                   }
                   required
                 />
              </div>
              
              <div className="col-md-4 mt-3">
                 <label htmlFor="formStartTime" className="form-label">Fecha y Hora de Inicio</label>
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
                   <label htmlFor="formActive" className="form-check-label">Activa</label>
                 </div>
              </div>

              <div className="col-md-2 mt-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">Guardar</button>
              </div>
            </form>
          </section>

          <section className="panel-card">
            <div className="panel-title">Reservas registradas</div>
            {reservas.length === 0 ? (
              <div className="empty">No hay reservas.</div>
            ) : (
              // --- ¡TABLA MODIFICADA! ---
              <table className="table table-striped align-middle table-responsive">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Laboratorio</th>
                    <th>Reservado Por</th>
                    <th>Propósito</th>
                    <th>Inicio</th>
                    <th>Activa</th>
                    <th>Creado en</th>
                    <th>Owner ID</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>{r.lab_name}</td>
                      <td>{r.reserved_by}</td>
                      <td>{r.purpose}</td>
                      {/* Formateamos las fechas para mejor legibilidad */}
                      <td>{new Date(r.start_time).toLocaleString('es-GT')}</td>
                      <td>{r.active ? "Sí" : "No"}</td>
                      <td>{new Date(r.created_at).toLocaleString('es-GT')}</td>
                      <td>{r.owner_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      );
    }
    
    // --- (Resto de tus componentes de sección) ---
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
      return <ReportesSection />;
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

  return (
     <div className="layout">
       <Sidebar
         collapsed={collapsed}
         onToggle={() => setCollapsed(!collapsed)}
         onSelect={(s) => setSection(s)}
         current={section}
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
     </div>
   );
}