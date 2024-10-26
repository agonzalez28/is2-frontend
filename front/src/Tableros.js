import React, { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom';
import './Tableros.css';
import Modal from './Modal'; // Importa el modal


const Tableros = () => {
  const { title } = useParams(); 
  const [lists, setLists] = useState([]); 
  const [showOptionsIndex, setShowOptionsIndex] = useState(null); 
  const [listName, setListName] = useState(""); 
  const [showInput, setShowInput] = useState(false); 
  const [cardName, setCardName] = useState(""); 
  const [showCardInputIndex, setShowCardInputIndex] = useState(null); 
  const [selectedCard, setSelectedCard] = useState(null); // Para controlar la tarjeta seleccionada
  const [showModal, setShowModal] = useState(false); // Para controlar el modal
  const [descripcion, setDescripcion] = useState(''); // Estado para la descripción
  const [createdDate, setCreatedDate] = useState(''); // Estado para la fecha de creación
  const [modifiedDate, setModifiedDate] = useState(''); // Estado para la fecha de modificación
  const [subtareas, setSubtareas] = useState([]); // Estado para las subtareas
  const [newSubtarea, setNewSubtarea] = useState(''); // Para manejar el input de la nueva subtarea
  const [showSubtareaInput, setShowSubtareaInput] = useState(false);
  const [visibility, setVisibility] = useState('Finalizado'); // Estado para la visibilidad
  const [etiqueta, setEtiqueta] = useState(''); // Estado para la etiqueta
  const [showSubtareaModal, setShowSubtareaModal] = useState(false); // Controla la visibilidad del modal
  const [selectedSubtarea, setSelectedSubtarea] = useState(null); // Guarda la subtarea seleccionada

  const maxWords = 50; // Límite de palabras
  const navigate = useNavigate(); 

  const handleDescripcionChange = (e) => {
    const words = e.target.value.split(/\s+/); // Divide por espacios
    if (words.length <= maxWords) {
      setDescripcion(e.target.value);
    }
  };

  const toggleSubtareaInput = () => {
    setShowSubtareaInput(!showSubtareaInput);
  };
  
  useEffect(() => {
    const textarea = document.querySelector('.descripcion-textarea');
    if (textarea) {
      textarea.style.height = 'auto'; // Reinicia la altura
      textarea.style.height = textarea.scrollHeight + 'px'; // Ajusta la altura
    }
  }, [descripcion]); // Solo se ejecuta cuando el contenido de la descripción cambia

  const sumarDias = (fecha, dias) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  };  

  // Función para obtener la fecha y hora actual en formato "dd/mm/yyyy hh:mm:ss"
  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses empiezan en 0
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

    const handleGoToMenu = () => {
      navigate('/menu');  
    };

   // Añadir una subtarea
   const handleAddSubtarea = () => {
    if (newSubtarea.trim() !== '' && selectedCard) {
      const updatedLists = [...lists];  // Copia el estado actual de las listas
      const { listIndex, cardIndex } = selectedCard;  // Desestructuramos la tarjeta seleccionada
  
      // Verifica si la tarjeta seleccionada existe en el estado de listas
      if (updatedLists[listIndex] && updatedLists[listIndex].cards[cardIndex]) {
        updatedLists[listIndex].cards[cardIndex].subtareas.push({
          text: newSubtarea,
          estado: 'En_Curso'
        });
        setLists(updatedLists);  // Actualizamos el estado global de las listas
        setSubtareas([...updatedLists[listIndex].cards[cardIndex].subtareas]);  // Sincroniza el estado de subtareas
        setNewSubtarea('');  // Limpiamos el campo de nueva subtarea
      } else {
        console.error('La tarjeta seleccionada no es válida.');
      }
    }
  };
  
  const handleAddList = () => {
    if (listName.trim() !== "") {
      const newList = { name: listName, cards: [] }; 
      setLists([...lists, newList]); 
      setListName(""); 
      setShowInput(false); 
    } else {
      alert("El nombre de la lista no puede estar vacío");
    }
  };

  const handleDeleteList = (index) => {
    const updatedLists = lists.filter((_, i) => i !== index); 
    setLists(updatedLists); 
    setShowOptionsIndex(null); 
  };

  const toggleOptions = (index) => {
    setShowOptionsIndex(index === showOptionsIndex ? null : index); 
  };

  const handleAddCard = (index) => {
    if (cardName.trim() !== "") {
      const updatedLists = [...lists];
      updatedLists[index].cards.push({
        name: cardName,
        subtareas: [],
        etiquetaColor: getRandomGradient(), // Asigna el gradiente aleatorio aquí
      });
      
      const fechaModificada = sumarDias(new Date(), 7); // Suma 7 días a la fecha actual
      setLists(updatedLists); 
      setCardName(""); 
      setShowCardInputIndex(null); 
      setCreatedDate(getCurrentDate()); // Asigna la fecha actual al crear una tarjeta
      setModifiedDate(fechaModificada.toLocaleString()); // Asigna la fecha modificada con días sumados
    } else {
      alert("El nombre de la tarjeta no puede estar vacío");
    }
  };
  
  const handleSubtareaClick = (subtarea) => {
    setSelectedSubtarea(subtarea); // Establece la subtarea seleccionada
    setShowSubtareaModal(true); // Muestra el modal
  };  

  const handleCardClick = (listIndex, cardIndex) => {
    const selectedCard = lists[listIndex]?.cards[cardIndex];  // Verifica que la tarjeta existe
    if (selectedCard) {
      setSelectedCard({ ...selectedCard, listIndex, cardIndex });  // Guarda el índice de la lista y tarjeta
      setSubtareas([...selectedCard.subtareas]);  // Carga las subtareas de la tarjeta seleccionada
      setShowModal(true);  // Mostrar el modal
    } else {
      console.error('No se encontró la tarjeta.');
    }
  };

  const handleCloseModal = () => {
    if (selectedCard) {
      const updatedLists = [...lists];
      const { listIndex, cardIndex } = selectedCard;
  
      // Agregar la etiqueta a la tarjeta seleccionada
      updatedLists[listIndex].cards[cardIndex].etiqueta = etiqueta;
  
      setLists(updatedLists);  // Actualiza el estado de las listas
    }
    setShowModal(false); // Cerrar el modal
    setSelectedCard(null); // Limpiar la tarjeta seleccionada
  };

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)', // Lila suave a azul claro
      'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)', // Lila oscuro a azul púrpura
      'linear-gradient(135deg, #A18CD1 0%, #5D26C1 100%)', // Lila claro a azul oscuro
      'linear-gradient(135deg, #C471ED 0%, #12C2E9 100%)', // Lila brillante a azul cielo
      'linear-gradient(135deg, #D9AFD9 0%, #97D9E1 100%)', // Lila pastel a azul pastel
      'linear-gradient(135deg, #F3A4E9 0%, #5190EB 100%)'  // Lila rosa a azul eléctrico
    ];
    
    // Selecciona un índice aleatorio de la lista de gradientes
    const randomIndex = Math.floor(Math.random() * gradients.length);
    return gradients[randomIndex];
  };
  
  return (
    <div className="tableros-container">
      <div className="tablero-solapa">
          {title} 
      </div>
      <div className="tablero-esquina">
          <img 
            src="/img11_Config.png" 
            alt="Configuración"
            className="menu-icon"
          />
      </div>
      <main className="tableros-main">
        <div className={`list-container ${lists.length === 0 ? 'no-lists' : ''}`}>
          {lists.map((list, index) => (
            <div key={index} className="list">
              <h3>{list.name}</h3>
              <div className="options-menu-container">
                <button className="options-button" onClick={() => toggleOptions(index)}>
                  <i className="fas fa-ellipsis-h"></i>
                </button>
                {showOptionsIndex === index && (
                  <div className="options-menu">
                    <button onClick={() => handleDeleteList(index)}>Eliminar</button>
                  </div>
                )}
              </div>
              <div className="cards-container">
              {list.cards && list.cards.map((card, cardIndex) => (
                <div 
                  key={cardIndex} 
                  className="card" 
                  onClick={() => handleCardClick(index, cardIndex)} // Redirigir al hacer clic en la tarjeta
                >
                  {card.etiqueta && (
                    <div className="etiqueta" style={{ background: card.etiquetaColor || 'linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)' }}>
                      {card.etiqueta}
                    </div>
                  )}
                  {card.name} {/* Accede a la propiedad 'name' del objeto 'card' */}
                </div>
              ))}
              </div>
              {showCardInputIndex === index ? (
                <div className="add-card-form">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                  <div className="add-card-buttons">
                    <button className="add-card-button" onClick={() => handleAddCard(index)}>Añadir tarjeta</button>
                    <button className="close-button" onClick={() => setShowCardInputIndex(null)}>X</button>
                  </div>
                </div>
              ) : (
                <button className="add-card-button" onClick={() => setShowCardInputIndex(index)}>
                  <strong> + Añadir una tarjeta </strong>
                </button>
              )}
            </div>
          ))}
          <div className={`add-list ${lists.length === 0 ? 'first-list' : ''}`}>
            {!showInput && (
              <button onClick={() => setShowInput(true)}>
                <i className="fas fa-plus"></i> Añade otra lista
              </button>
            )}
            {showInput && (
              <div className="add-list-form">
                <input
                  type="text"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Nombre de la lista..."
                />
                <div className="add-list-buttons">
                  <button className="add-list-button" onClick={handleAddList}>Añadir Lista</button>
                  <button className="close-button" onClick={() => setShowInput(false)}>X</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      {/* Modal para mostrar los detalles de la tarjeta */}
      <Modal show={showModal} onClose={handleCloseModal}>
        <div className="tarjeta-detalle-container">
          {/* Botón "X" para cerrar el modal */}
          <button className="close-modal-button" onClick={handleCloseModal}>X</button>
          <div className="tarjeta-cabecera">
            <h2>{selectedCard?.name}</h2>  {/* Verifica que 'selectedCard' no sea null o undefined antes de acceder a 'name' */}
                <select
                    id="visibility"
                    name="visibility"
                    className={`input-field ${visibility.toLowerCase().replace(' ', '-')}`} // Generar la clase dinámica
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En   Curso">En Curso</option>
                    <option value="Finalizado">Finalizado</option>
                </select>
          </div>
          <div className="tarjeta-contenido">
            <div className="columna-izquierda">
              <div className="descripcion">
                  <h3>Descripción</h3>
                  <textarea
                    className="descripcion-textarea"
                    value={descripcion}
                    onChange={handleDescripcionChange}
                  />
              </div>
              <div className="subtareas">
                <h3>Subtareas 
                  <button className="add-subtarea-button" onClick={toggleSubtareaInput}>
                    + Agregar Subtarea
                  </button>
                </h3>
                
                {/* Solo muestra el input si showSubtareaInput es true */}
                {showSubtareaInput && (
                  <div className="subtarea-input-container">
                  <input
                    type="text"
                    className="subtarea-input" // Para aplicar el estilo
                    value={newSubtarea}
                    onChange={(e) => setNewSubtarea(e.target.value)}
                    placeholder="Escribe una subtarea..."
                  />
                  {/* Botón para guardar la subtarea */}
                  <button className="crear-subtarea-button" onClick={handleAddSubtarea}>
                    Crear
                  </button>
                </div>
                )}

                {/* Muestra las subtareas si hay alguna */}
                {subtareas.length > 0 ? (
                  <ul>
                    {subtareas.map((subtarea, index) => (
                      <li key={index} onClick={() => handleSubtareaClick(subtarea)}> {/* Al hacer clic, abre el modal */}
                        <span>{subtarea.text}</span>
                        <span
                          className={`estado-boton ${subtarea.estado.toLowerCase()}`} // Agrega una clase dinámica según el estado
                        >
                          {subtarea.estado}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  // Si no hay subtareas y no se está mostrando el input, muestra el mensaje
                  !showSubtareaInput && <p>No hay subtareas.</p>
                )}
              </div>
            </div>
            <div className="columna-derecha">
              <div className="detalles">
                <h3>Detalles</h3>
                <p1>Persona Asignada  <input type="text" placeholder="Asignado a..." /></p1>
                <p1>Creado el </p1>
                <p>{createdDate}</p>
                <p1>Vence el </p1>
                <p>{modifiedDate}</p>
                <p1>Añadir Etiqueta 
                  <input 
                    type="text" 
                    value={etiqueta} // Conecta el input con el estado "etiqueta"
                    onChange={(e) => setEtiqueta(e.target.value)} // Actualiza el estado cuando el usuario escribe
                    placeholder="Etiqueta" 
                  />
                </p1>
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <footer className="tableros-footer">
        <p>© TaskFlow - 2024</p>
      </footer>
    </div>
  );
};

export default Tableros;
