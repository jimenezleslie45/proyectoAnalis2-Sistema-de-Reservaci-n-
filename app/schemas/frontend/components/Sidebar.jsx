import React from "react";
import {
  FaTachometerAlt,
  FaCalendarCheck,
  FaFlask,
  FaBuilding,
  FaUsers,
  FaChartBar,
  FaCalendarAlt,
  FaCogs,
  FaSignOutAlt,
  FaBars,
  FaFlask as LabIcon,
} from "react-icons/fa";

const items = [
  { id: "panel", label: "Panel", icon: <FaTachometerAlt /> },
  { id: "reservas", label: "Reservas", icon: <FaCalendarCheck /> },
  { id: "equipos", label: "Equipos", icon: <FaFlask /> },
  { id: "salas", label: "Salas", icon: <FaBuilding /> },
  { id: "usuarios", label: "Usuarios", icon: <FaUsers /> },
  { id: "informes", label: "Informes", icon: <FaChartBar /> },
  { id: "calendario", label: "Calendario", icon: <FaCalendarAlt /> },
  { id: "config", label: "Configuraciones", icon: <FaCogs /> },
];

export default function Sidebar({ collapsed, onToggle, onSelect, current }) {
  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="brand">
        <div className="brand-logo"><LabIcon /></div>
        {!collapsed && <div className="brand-text">Laboratorio</div>}
        <button className="burger" onClick={onToggle}><FaBars /></button>
      </div>

      <nav className="menu">
        {items.map((it) => (
          <button
            key={it.id}
            className={`menu-item ${current === it.id ? "active" : ""}`}
            onClick={() => onSelect(it.id)}
            type="button"
          >
            <span className="menu-icon">{it.icon}</span>
            {!collapsed && <span className="menu-text">{it.label}</span>}
          </button>
        ))}
      </nav>

      <div className="logout">
        <button className="menu-item danger" type="button">
          <span className="menu-icon"><FaSignOutAlt /></span>
          {!collapsed && <span className="menu-text">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
