import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { tasks } from './data';

const Dashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [boards, setBoards] = useState([]);
  const maxBoards = 9;
  const [errorMessage, setErrorMessage] = useState("");
  const [visibility, setVisibility] = useState('Pública');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  const gradients = [
    'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  ];

  useEffect(() => {
    if (!onLogout) {
      navigate('/');
    }
  }, [onLogout, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleBackClick = () => navigate('/');
  const handleCloseForm = () => setShowForm(false);
  const handleCreateBoard = (boardTitle) => {
    if (boards.length >= maxBoards) {
      setErrorMessage("Has alcanzado el número máximo de tableros permitidos.");
      return;
    }

    if (boardTitle) {
      const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
      const newBoard = { title: boardTitle, visibility, color: randomGradient };
      setBoards([...boards, newBoard]);
      setShowForm(false);
    }
  };

  const handleBoardClick = (title) => {
    navigate(`/menu/${title}`);
  };

  const handleDeleteBoard = (index) => {
    const newBoards = boards.filter((_, boardIndex) => boardIndex !== index);
    setBoards(newBoards);
    if (newBoards.length === 0) setShowForm(false);
  };

  // Contadores de tareas
  const taskCounts = {
    'To Do': 0,
    'In Progress': 0,
    'Done': 0,
  };

  const currentDate = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(task => task.status === 'To Do' && task.dueDate < currentDate);
  
  const userTasks = tasks.reduce((acc, task) => {
    acc[task.assignedTo] = (acc[task.assignedTo] || 0) + 1;
    return acc;
  }, {});

  tasks.forEach(task => {
    taskCounts[task.status]++;
  });

  // Datos para los gráficos
  const barData = [
    { name: 'Por Hacer', count: taskCounts['To Do'] },
    { name: 'En Progreso', count: taskCounts['In Progress'] },
    { name: 'Completado', count: taskCounts['Done'] },
  ];

  const pieData = Object.keys(userTasks).map(user => ({
    name: user,
    value: userTasks[user],
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', margin: '10px', overflowY: 'auto', maxHeight: '300px' }}>
            <h2>Por Hacer</h2>
            {tasks.filter(task => task.status === 'To Do').map(task => <div key={task.id}>{task.title}</div>)}
          </div>
          <div style={{ flex: '1', margin: '10px', overflowY: 'auto', maxHeight: '300px' }}>
            <h2>En Progreso</h2>
            {tasks.filter(task => task.status === 'In Progress').map(task => <div key={task.id}>{task.title}</div>)}
          </div>
          <div style={{ flex: '1', margin: '10px', overflowY: 'auto', maxHeight: '300px' }}>
            <h2>Completado</h2>
            {tasks.filter(task => task.status === 'Done').map(task => <div key={task.id}>{task.title}</div>)}
          </div>
          <div style={{ flex: '1', margin: '10px', overflowY: 'auto', maxHeight: '300px' }}>
            <h2>Tareas Atrasadas</h2>
            {overdueTasks.length > 0 ? (
              overdueTasks.map(task => <div key={task.id}>{task.title} (Vencida: {task.dueDate})</div>)
            ) : (
              <p>No hay tareas atrasadas.</p>
            )}
          </div>
        </div>

        {/* Gráficos */}
        <h2>Distribución de Tareas por Usuario Asignado</h2>
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>

        <h2>Distribución de Tareas por Estado</h2>
        <BarChart width={500} height={300} data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </main>
      {showForm && (
        <div className="form-modal">
          {/* Código del formulario */}
        </div>
      )}
      <footer className="workspace-footer">
        <p>© TaskFlow - 2024</p>
      </footer>
    </div>
  );
};

export default Dashboard;
