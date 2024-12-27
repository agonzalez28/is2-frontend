import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import api from './api';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [taskStats, setTaskStats] = useState({}); // Para los gráficos
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const cod_tablero = localStorage.getItem('cod_tablero'); // Obtiene el cod_tablero de LocalStorage


  // Fetch para obtener los datos desde el backend
  const fetchTaskStats = async () => {
    try {
      const [usuariosResponse, estadosResponse, atrasadasResponse] = await Promise.all([
        api.get(`tarjetas/por_usuario/${cod_tablero}/`),
        api.get(`tarjetas/por_estado/${cod_tablero}/`),
        api.get(`tarjetas/atrasadas/${cod_tablero}/`),
      ]);

      const usuariosData = usuariosResponse.data.tarjetas_por_usuario.map(user => ({
        name: user.usu_encargado || 'No Asignado',
        value: user.total,
      }));

      const estadosData = estadosResponse.data.tarjetas_por_estado.map(state => ({
        name: state.estado,
        count: state.total,
      }));

      setTaskStats({
        usuarios: usuariosData,
        estados: estadosData,
        atrasadas: atrasadasResponse.data.tarjetas_atrasadas,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de tareas:', error);
    }
  };

  useEffect(() => {
    fetchTaskStats();
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
      <div className="workspace-container">
        <header className="workspace-header">
          <h1>TaskFlow</h1>
          <div className="user-session">
            <button onClick={onLogout}>Cerrar Sesión</button>
          </div>
        </header>
        <main className="workspace-main" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 100px)', marginTop: '100px' }}>
          <h1 style={{ marginTop: '800px' }}>Tablero de Tareas</h1>
          <p>Última recarga: {lastUpdated}</p>

          {/* Gráfico de distribución de tareas por usuario */}
          <h2>Distribución de Tareas por Usuario</h2>
          <PieChart width={400} height={300}>
            <Pie
                data={taskStats.usuarios || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
            >
              {(taskStats.usuarios || []).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>

          {/* Gráfico de distribución de tareas por estado */}
          <h2>Distribución de Tareas por Estado</h2>
          <BarChart width={500} height={300} data={taskStats.estados || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>

          {/* Información adicional */}
          <h2>Tarjetas Atrasadas</h2>
          <p>Total: {taskStats.atrasadas || 0}</p>
        </main>
        <footer className="workspace-footer">
          <p>© TaskFlow - 2024</p>
        </footer>
      </div>
  );
};

export default Dashboard;