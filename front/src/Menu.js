import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Menu.css'; // Importar los estilos

const Menu = ({ onLogout }) => {
    const navigate = useNavigate();
    const { title } = useParams(); // Obtener el título del workspace desde la URL
    const [showForm, setShowForm] = useState(false);
    const [boards, setBoards] = useState([]); // Almacena los tableros creados
    const [boardTitle, setBoardTitle] = useState(""); // Para almacenar el título del tablero
    const [boardDescription, setBoardDescription] = useState(""); // Para almacenar la descripción del tablero
    const maxBoards = 9; // Máximo número de tableros permitidos
    const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
    const gradients = [
        'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)', // Lila a azul
        'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', // Celeste a azul
        'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // Lila claro a rosa claro
        'linear-gradient(135deg, #70e1f5 0%, #ffd194 100%)', // Celeste a dorado suave
        'linear-gradient(135deg, #89fffd 0%, #6b9eff 100%)', // Azul suave a celeste
        'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)'  // Verde suave a celeste
    ];

    const cod_usuario = localStorage.getItem('cod_usuario'); // Obtener cod_usuario desde el localStorage
    const cod_espacio = localStorage.getItem('cod_espacio'); // Obtener cod_espacio de localStorage
    
    useEffect(() => {
        // Si no está autenticado, redirige a la página de inicio de sesión
        if (!cod_usuario) {
            navigate('/');
        } else {
          fetchBoards(); // Llama a la funcion para obtener los tableros que existan
        }
    }, [cod_usuario, cod_espacio, navigate]);

    // Función para obtener los tableros desde el backend
    const fetchBoards = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/tableros/tableros/${cod_espacio}/`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setBoards(data.map(board => ({
                    title: board.nom_tablero,
                    id: board.cod_tablero, // Agregado para la eliminación
                    color: gradients[Math.floor(Math.random() * gradients.length)],
                })));
            } else {
                setErrorMessage("No se encontraron tableros.");
            }
        } catch (error) {
            console.error('Error fetching boards:', error);
            setErrorMessage("Error al obtener los tableros.");
        }
    };


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
        setBoardTitle(""); // Limpiar el título al cerrar el formulario
        setBoardDescription(""); // Limpiar la descripción al cerrar el formulario
    };

    const handleCreateBoard = async () => {
        if (boards.length >= maxBoards) {
            setErrorMessage("Has alcanzado el número máximo de tableros permitidos."); // Establecer el mensaje de error
            return;
        }

        if (boardTitle && boardDescription) { // Verificar que tanto el título como la descripción estén definidos
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];
            const newBoard = {
                nom_tablero: boardTitle,
                descripcion: boardDescription,
                cod_espacio: cod_espacio, // Usar cod_espacio obtenido del localStorage
                cod_usuario: cod_usuario // Usar cod_usuario obtenido del localStorage
            };

            try {
                const response = await fetch('http://localhost:8000/api/tableros/crear/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newBoard),
                });

                const data = await response.json(); // Captutar respuesta del backend

                if (response.ok) {
                    // Si se creó correctamente, añade el nuevo tablero 
                    setBoards(prevBoards => [...prevBoards, { title: boardTitle, color: randomGradient, id: data.cod_tablero }]);
                    console.log("Tablero creado con éxito! ");
                    handleCloseForm(); // Cerrar el formulario
                } else {
                    // Manejo de errores
                    setErrorMessage(data.error || "Error al crear el tablero");
                }
            } catch (error) {
                console.error('Error creating board:', error);
                setErrorMessage("Error en la conexión con el servidor");
            }
        } else {
            setErrorMessage("El título y la descripción son obligatorios."); // Agregar manejo de error si no están completos
        }
    };

    const handleBoardClick = (title) => {
        navigate(`/tableros/${title}`);
    };

    // Función para eliminar un tablero
    const handleDeleteBoard = async (index) => {
        const boardToDelete = boards[index];
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar el tablero "${boardToDelete.title}"?`);

        if (confirmDelete) {
            try {
                const response = await fetch(`http://localhost:8000/api/tableros/eliminar/${boardToDelete.id}/`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    const newBoards = boards.filter((_, boardIndex) => boardIndex !== index); // Filtrar los tableros y eliminar el seleccionado
                    setBoards(newBoards); // Actualizar el estado con los tableros restantes
                    
                    // Si después de eliminar no quedan tableros, se muestra el formulario para crear uno nuevo.
                    if (newBoards.length === 0) {
                        setShowForm(false);
                    }
                } else {
                    setErrorMessage("Error al eliminar el tablero.");
                }
            } catch (error) {
                console.error('Error deleting board:', error);
                setErrorMessage("Error en la conexión con el servidor");
            }
        }
    };

    return (
        <div className="menu-container">
            <header className="menu-header">
                <div className="create-board-icon" onClick={handleCreateBoardClick}>
                    <div className="tooltip">
                        <img src="/img10_Crea_Tablero.png" alt="Crear Tablero" className="create-icon" />
                        <span className="tooltiptext">Crear un nuevo tablero</span>
                    </div>
                </div>
                <h1>TaskFlow</h1>
                <div className="user-session">
                    <i className="fas fa-user-circle"></i>
                    <button onClick={onLogout}>Cerrar Sesión</button>
                </div>
            </header>
            <main className="menu-main">
                <h2 className="workspace-title">{title}</h2>
                {errorMessage && (
                    <div className="error-message">
                        <span>{errorMessage}</span>
                        <button className="close-error" onClick={() => setErrorMessage("")}></button>
                    </div>
                )}
                {boards.length > 0 && (
                    <h2 className="workspace-title">Mis Tableros</h2>
                )}
                {(boards.length === 0 && !showForm) ? (
                    <div>
                        <img src="/img9_Workspace.png" alt="No se encuentran Tableros" className="menu-image" />
                        <p>Crea tu primer tablero :)</p>
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
                                    <i className="fas fa-times"></i> {/* Usando FontAwesome para el ícono de "X" */}
                                </button>
                            </div>
                        ))}
                        <div className="board create-new" onClick={handleCreateBoardClick}>
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
                            <h2>Crear Tablero</h2>
                            <span className="close-form" onClick={handleCloseForm}>&times;</span>
                        </div>
                        <div className="form-image-container">
                          <img src="/img7_Tablero_Default.png" alt="Ejemplo de Tablero" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="boardTitle">Titulo del Tablero</label>
                            <input 
                                type="text" 
                                id="boardTitle" 
                                name="boardTitle" 
                                className="input-field" 
                                value={boardTitle}
                                onChange={(e) => setBoardTitle(e.target.value)} // Cambiar el estado con la entrada del usuario
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') handleCreateBoard();
                                }}
                            />
                            <label htmlFor="boardDescription">Descripción</label>
                            <input 
                                type="text" 
                                id="boardDescription" 
                                name="boardDescription" 
                                className="input-field" 
                                value={boardDescription}
                                onChange={(e) => setBoardDescription(e.target.value)} // Cambiar el estado con la entrada del usuario
                            />
                        </div>
                        <button className="create-board-button" onClick={handleCreateBoard}>
                            Crear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Menu;
