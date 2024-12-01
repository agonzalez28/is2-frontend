import React, { useState, useEffect } from 'react';  
import { useParams, useNavigate } from 'react-router-dom';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker'; 
import './Tableros.css';
import Modal from './Modal'; 
import SubtareaModal from './SubModal'; 

const Tableros = () => {
  const { title } = useParams(); 
  const [lists, setLists] = useState([]); 
  const [showOptionsIndex, setShowOptionsIndex] = useState(null); 
  const [listName, setListName] = useState(""); 
  const [showInput, setShowInput] = useState(false); 
  const [cardName, setCardName] = useState(""); 
  const [showCardInputIndex, setShowCardInputIndex] = useState(null); 
  const [selectedCard, setSelectedCard] = useState(null); 
  const [showModal, setShowModal] = useState(false); 
  const [descripcion, setDescripcion] = useState(''); 
  const [createdDate, setCreatedDate]  = useState(''); ; 
  const [modifiedDate, setModifiedDate] = useState(''); 
  const [subtareas, setSubtareas] = useState([]); 
  const [newSubtarea, setNewSubtarea] = useState(''); 
  const [showSubtareaInput, setShowSubtareaInput] = useState(false);
  const [visibility, setVisibility] = useState('Finalizado'); 
  const [etiqueta, setEtiqueta] = useState(''); 
  const [showSubtareaModal, setShowSubtareaModal] = useState(false); 
  const [selectedSubtarea, setSelectedSubtarea] = useState(null); 
  const maxWords = 50; 
  const navigate = useNavigate(); 
  const cod_tablero = localStorage.getItem('cod_tablero'); // Obtiene el cod_tablero de LocalStorage

  const handleDescripcionChange = (e) => {
    const words = e.target.value.split(/\s+/);
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
      textarea.style.height = 'auto'; 
      textarea.style.height = textarea.scrollHeight + 'px'; 
    }
  }, [descripcion]);

useEffect(() => {
  const fetchLists = async () => {
    if (!cod_tablero) {
      console.error("No se encontró el código del tablero.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/tableros/listas/obtener_listas_tableros/${cod_tablero}/`);
      if (response.ok) {
        const data = await response.json();
        const updatedLists = await Promise.all(data.listas.map(async (lista) => {
          // Obtener las tarjetas de cada lista
          const cardsResponse = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/obtener_tarjetas/${lista.cod_lista}/`);
          const cardsData = await cardsResponse.json();
          return {
            cod_lista: lista.cod_lista,
            name: lista.nom_lista,
            cards: cardsData.tarjetas || [] 
          };
        }));

        setLists(updatedLists); // Actualiza el estado de las listas con las tarjetas
      } else {
        console.error("Error al obtener las listas:", response.statusText);
      }
    } catch (error) {
      console.error("Error al obtener las listas:", error);
    }
  };

  fetchLists();
}, [cod_tablero]);

  const sumarDias = (fecha, dias) => {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    return nuevaFecha;
  };  

  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const handleGoToMenu = () => {
    navigate('/menu');  
  };

  const handleAddSubtarea = () => {
    if (newSubtarea.trim() !== '' && selectedCard) {
      const updatedLists = [...lists];
      const { listIndex, cardIndex } = selectedCard;
  
      if (updatedLists[listIndex] && updatedLists[listIndex].cards[cardIndex]) {
        updatedLists[listIndex].cards[cardIndex].subtareas.push({
          text: newSubtarea,
          estado: 'En_Curso'
        });
        setLists(updatedLists);
        setSubtareas([...updatedLists[listIndex].cards[cardIndex].subtareas]);
        setNewSubtarea('');
      } else {
        console.error('La tarjeta seleccionada no es válida.');
      }
    }
  };

  const handleDeleteList = async (cod_lista) => {
    if (!cod_lista) {
      console.error("codLista es undefined");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/tableros/listas/eliminar_lista/${cod_lista}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log("Lista eliminada exitosamente");
        // Actualiza el estado para reflejar la eliminación en la UI
        setLists(lists.filter((list) => list.cod_lista !== cod_lista));
      } else {
        console.error("Error al eliminar la lista:", response.statusText);
      }
    } catch (error) {
      console.error("Error al eliminar la lista:", error);
    }
  };

  const toggleOptions = (index) => {
    setShowOptionsIndex(index === showOptionsIndex ? null : index); 
  };

  const handleAddCard = async (index) => {
    if (cardName.trim() !== "") {
        const updatedLists = [...lists];

        // Definir nueva tarjeta para el frontend
        const newCard = {
            name: cardName,
            subtareas: [],
            etiquetaColor: getRandomGradient(),
        };

        updatedLists[index].cards.push(newCard);

        // Realiza el POST al backend para agregar la tarjeta
        try {
            const response = await fetch('http://localhost:8000/api/tableros/listas/tarjetas/crear_tarjeta/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nom_tarjeta: cardName,
                    cod_lista: updatedLists[index].cod_lista,  // Envía el cod_lista de la lista donde agregarás la tarjeta
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Tarjeta agregada:", data);

                // Actualiza la tarjeta en el estado local con el cod_tarjeta generado
                updatedLists[index].cards[updatedLists[index].cards.length - 1] = { 
                    ...newCard, 
                    cod_tarjeta: data.cod_tarjeta,  // Asigna el cod_tarjeta recibido del backend
                };

                setLists(updatedLists);
                setCardName("");  // Limpia el campo de nombre de tarjeta
                setShowCardInputIndex(null);  // Oculta el campo de entrada
                setCreatedDate(getCurrentDate());  // Establece la fecha de creación
                setModifiedDate(sumarDias(new Date(), 7).toLocaleString());  // Modifica la fecha de modificación
            } else {
                console.error("Error al agregar la tarjeta:", response.statusText);
                alert("Error al agregar la tarjeta");
            }
        } catch (error) {
            console.error("Error al agregar la tarjeta:", error);
            alert("Error al agregar la tarjeta");
        }
    } else {
        alert("El nombre de la tarjeta no puede estar vacío");
    }
};
  
  const handleSubtareaClick = (subtarea) => {
    setSelectedSubtarea(subtarea);
    setShowSubtareaModal(true);
  };  

  const handleCardClick = (listIndex, cardIndex) => {
    const selectedCard = lists[listIndex]?.cards[cardIndex]; 
    if (selectedCard) {
      setSelectedCard({ ...selectedCard, listIndex, cardIndex });
      setSubtareas(Array.isArray(selectedCard.subtareas) ? selectedCard.subtareas : []);
      setShowModal(true);
    } else {
      console.error('No se encontró la tarjeta.');
    }
    
  };

  const handleUpdateCard = async (cod_tarjeta) => {
    try {
      const updatedData = {
        nom_tarjeta: selectedCard?.name, // O lo que sea necesario actualizar
        descripcion: descripcion, // O cualquier otro campo
      };
  
      // Hacer la solicitud PUT al backend
      const response = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/actualizar_tarjeta/${cod_tarjeta}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Actualiza el estado del frontend con la respuesta del backend
        console.log(result);
        alert("Tarjeta actualizada con éxito.");
        // Aquí podrías actualizar el estado local o hacer otras acciones necesarias.
      } else {
        throw new Error(result.error || 'Hubo un error al actualizar la tarjeta');
      }
    } catch (error) {
      console.error("Error al actualizar tarjeta:", error);
      alert(error.message);
    }
  };  

  const handleCloseModal = () => {
    if (selectedCard) {
      const updatedLists = [...lists];
      const { listIndex, cardIndex } = selectedCard;
  
      updatedLists[listIndex].cards[cardIndex].etiqueta = etiqueta;
  
      setLists(updatedLists);
    }
    setShowModal(false);
    setSelectedCard(null);
  };

  const getRandomGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)',
      'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
      'linear-gradient(135deg, #A18CD1 0%, #5D26C1 100%)',
      'linear-gradient(135deg, #C471ED 0%, #12C2E9 100%)',
      'linear-gradient(135deg, #D9AFD9 0%, #97D9E1 100%)',
      'linear-gradient(135deg, #F3A4E9 0%, #5190EB 100%)'
    ];
    
    const randomIndex = Math.floor(Math.random() * gradients.length);
    return gradients[randomIndex];
  };

  const handleAddList = async () => {
    if (!listName.trim()) {
      alert("Por favor, ingresa un nombre para la lista.");
      return;
    } 
    
    const newList = {
      nom_lista: listName,
      cod_tablero: cod_tablero, // Usar cod_tablero obtenido del localStorage
      cant_tarjetas: 0 // Inicializa con 0 tarjetas
    };
    try {
      const response = await fetch('http://localhost:8000/api/tableros/listas/agregar_lista/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newList),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data); 
  
        // Actualiza la lista localmente después de la respuesta exitosa
        setLists([
          ...lists, 
          { 
            cod_lista: data.cod_lista,  // Usando el cod_lista devuelto por el backend
            name: listName, 
            cards: [] 
          }
        ]);
        setListName(""); // Limpia el campo de entrada
        setShowInput(false); // Oculta el campo de entrada
      } else {
        console.error("Error al agregar la lista:", response.statusText);
        alert("Error al agregar la lista");
      }
    } catch (error) {
      console.error("Error al agregar la lista:", error);
      alert("Error al agregar la lista");
    }
  };

  return (
    <div className="tableros-container">
    <div className="tablero-solapa">
        {title} 
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
                  <button onClick={() => handleDeleteList(list.cod_lista)}>Eliminar</button>
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
                {card.nom_tarjeta} {/* Accede a la propiedad 'name' del objeto 'card' */}
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
          <h2>{selectedCard?.nom_tarjeta}</h2>  {/* Verifica que 'selectedCard' no sea null o undefined antes de acceder a 'name' */}
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
            <button className="add-card-button" onClick={() => handleUpdateCard(selectedCard?.cod_tarjeta)}>
                <strong> + Actualizar Tarjeta </strong>
              </button>
          </div>
          <div className="columna-derecha">
            <div className="detalles">
              <h3>Detalles</h3>
              <p1>Persona Asignada  <input type="text" placeholder="Asignado a..." /></p1>
              <p1>Creado el </p1>
              <p>{createdDate || 'No disponible'}</p>
              <p1>Vence el </p1>
                  <DatePicker
                      selected={modifiedDate instanceof Date ? modifiedDate : new Date()}
                      onChange={(date) => setModifiedDate(date instanceof Date ? date : new Date())}
                      dateFormat="dd/MM/yyyy HH:mm:ss"
                      showTimeSelect
                      timeFormat="HH:mm:ss"
                      placeholderText="Selecciona una fecha y hora"
                  />
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
