import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Workspace.css';  // Importar los estilos

const Workspace = ({ onLogout }) => {
    const navigate = useNavigate();
    const [showForm, setShowForm] = useState(false);
    const [boards, setBoards] = useState([]);  // Almacena los tableros creados
    const maxBoards = 9; // Máximo número de tableros permitidos
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
    const [visibility, setVisibility] = useState('Pública'); // Estado para la visibilidad
    const gradients = [
        'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', // Lila a azul
        'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Celeste a azul
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Lila claro a rosa claro
        'linear-gradient(135deg, #70e1f5 0%, #ffd194 100%)', // Celeste a dorado suave
        'linear-gradient(135deg, #89fffd 0%, #6b9eff 100%)', // Azul suave a celeste
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'  // Verde suave a celeste
    ];
    const cod_usuario = localStorage.getItem('cod_usuario'); // Obtener cod_usuario
    const nombre = localStorage.getItem('nombre'); // Obtener el nombre del usuario

    useEffect(() => {
        if (!cod_usuario) {
            navigate('/'); // Redirige si no hay usuario
        }
        else {
          fetchWorkspaces(); // Llama a la función para obtener los workspaces
      }
    }, [cod_usuario, navigate]);

    useEffect(() => {
        if (errorMessage) {
            const timer = setTimeout(() => {
                setErrorMessage(""); // Limpiar el mensaje después de 5 segundos
            }, 5000); // 5 segundos

            return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta o si cambia el estado
        }
    }, [errorMessage]);

    const handleCreateBoardClick = () => {
        setShowForm(true); // Mostrar el formulario
    };

    const handleCloseForm = () => {
        setShowForm(false); // Cerrar el formulario
    };

    const handleCreateBoard = async (boardTitle, boardDescription) => {
        if (boards.length >= maxBoards) {
            setErrorMessage("Has alcanzado el número máximo de tableros permitidos."); // Establecer el mensaje de error
            return;
        }

        if (boardTitle && boardDescription) {
            const newBoard = {
                nom_proyecto: boardTitle,
                descripcion: boardDescription,
                estado: visibility,
                cod_usuario: cod_usuario, // Usar cod_usuario del localStorage
            };

            try {
                const response = await fetch('http://localhost:8000/api/workspace/crear/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBoard), 
                });
                if (!response.ok) throw new Error('Error al crear el workspace');

                const result = await response.json();  // Capturar la respuesta del backend
                setBoards([...boards, {
                    title: boardTitle,
                    description: boardDescription,
                    color: gradients[Math.floor(Math.random() * gradients.length)], // Asignar un color aleatorio
                }]);
                 console.log("Workspace creado exitosamente:", result);
                // Almacenar cod_espacio en localStorage
                 localStorage.setItem('cod_espacio', result.cod_espacio); // Almacena el cod_usuario
                 console.log('cod_espacio:', result.cod_espacio)

            setShowForm(false); // Cerrar el formulario
            } catch (error) {
                setErrorMessage(error.message);
            }
        } else {
            setErrorMessage("Faltan datos obligatorios");
        }
    };

    const handleBoardClick = (title) => {
        navigate(`/menu/${title}`);
    };

    const handleDeleteBoard = (index) => {
        const newBoards = boards.filter((_, boardIndex) => boardIndex !== index);
        setBoards(newBoards);
        if (newBoards.length === 0) {
            setShowForm(false);
        }
    };

  const fetchWorkspaces = async () => {
    const cod_usuario = localStorage.getItem('cod_usuario'); // Obtener el código de usuario
    try {
        const response = await fetch(`http://localhost:8000/api/workspace/workspaces/${cod_usuario}/`);
        if (!response.ok) throw new Error('Error al obtener los workspaces');

        const workspaces = await response.json();
        setBoards(workspaces.map(workspace => ({ 
            title: workspace.nom_proyecto,
            description: workspace.descripcion, 
            color: gradients[Math.floor(Math.random() * gradients.length)],
        })));
    } catch (error) {
        setErrorMessage(error.message);
    }
};

  return (
    <div className="workspace-container">
    <header className="workspace-header">
        <div className="create-board-icon" onClick={handleCreateBoardClick}>
            <div className="tooltip">
                <img src="img6_Crea_Workspace.png" alt="Crear Workspace" className="create-icon" />
                <span className="tooltiptext">Crear un nuevo Workspace</span>
            </div>
        </div>
        <h1>TaskFlow</h1>
        <div className="user-session">
            <i className="fas fa-user-circle"></i>
            <button onClick={onLogout}>Cerrar Sesión</button>
        </div>
    </header>
    <main className="workspace-main">
        {errorMessage && (
            <div className="error-message">
                <span>{errorMessage}</span>
                <button className="close-error" onClick={() => setErrorMessage("")}></button>
            </div>
        )}
        {boards.length > 0 && (
            <h2 className="workspace-title">Espacios de trabajo de {nombre}</h2>
        )}- 
        {(boards.length === 0 && !showForm) ? (
            <div>
                <img src="/img1.png" alt="No se encuentran Workspaces" className="workspace-image" />
                <p>No cuentas con ningún espacio de trabajo ahora mismo :(</p>
            </div>
        ) : (
            <div className="board-list">
                {boards.map((board, index) => (
                    <div key={index} className="board" style={{ background: board.color }} onClick={() => handleBoardClick(board.title)}>
                        <p style={{ color: 'white' }}>{board.title}</p>
                        <button className="delete-board-button" onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBoard(index);
                        }}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                ))}
                <div className="board create-new" onClick={() => setShowForm(true)}>
                    <span>+</span>
                </div>
            </div>
        )}
    </main>
    {showForm && (
        <div className="form-modal">
            <div className="form-container">
                <div className="form-header">
                    <i className="fas fa-arrow-left" onClick={handleCloseForm}></i>
                    <h2>Crear Workspace</h2>
                    <span className="close-form" onClick={handleCloseForm}>&times;</span>
                </div>
                <div className="form-image-container">
                    <img src="img7_Tablero_Default.png" alt="Ejemplo de Tablero" />
                </div>
                <div className="form-group">
                    <label htmlFor="boardTitle">Nombre del Workspace</label>
                    <input 
                        type="text" 
                        id="boardTitle" 
                        name="boardTitle" 
                        className="input-field" 
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleCreateBoard(e.target.value, document.getElementById('boardDescription').value);
                        }}
                    />
                    <label htmlFor="boardDescription">Descripción</label>
                    <input 
                        type="text" 
                        id="boardDescription" 
                        name="boardDescription" 
                        className="input-field" 
                    />
                    <label htmlFor="visibility">Visibilidad</label>
                    <select
                        id="visibility"
                        name="visibility"
                        className="input-field"
                        value={visibility}
                        onChange={(e) => setVisibility(e.target.value)}
                    >
                        <option value="Pública">Pública</option>
                        <option value="Privada">Privada</option>
                        <option value="Protegida">Protegida</option>
                    </select>
                </div>
                <button className="create-board-button" onClick={() => handleCreateBoard(document.getElementById('boardTitle').value, document.getElementById('boardDescription').value)}>
                    Crear
                </button>
            </div>
        </div>
    )}
    </div>
    );
};

export default Workspace;