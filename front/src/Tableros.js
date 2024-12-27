import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Tableros.css';
import Modal from './Modal';
import axios from 'axios'; // Importa Axios

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
  const [createdDate, setCreatedDate]  = useState('');
  const [modifiedDate, setModifiedDate] = useState('');
  const [subtareas, setSubtareas] = useState([]);
  const [newSubtarea, setNewSubtarea] = useState('');
  const [showSubtareaInput, setShowSubtareaInput] = useState(false);
  const [estado, setestado] = useState('Pendiente');
  const [etiqueta, setEtiqueta] = useState('');
  const [showSubtareaModal, setShowSubtareaModal] = useState(false);
  const [selectedSubtarea, setSelectedSubtarea] = useState(null);
  const cod_tablero = localStorage.getItem('cod_tablero'); // Obtiene el cod_tablero de LocalStorage
  //AGREGADO DULCE
  const [isEditingListName, setIsEditingListName] = useState(false);
  const [editingListIndex, setEditingListIndex] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null); // Estado para la tarjeta arrastrada
  const [personaAsignada, setPersonaAsignada] = useState(''); // Estado para la persona asignada
  const [warningMessage, setWarningMessage] = useState(""); // Estado para el mensaje de advertencia
  const [filtros, setFiltros] = useState({ usuario: '', etiqueta: '' }); // Maneja todos los filtros
  const maxWords = 50;
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  const handleDescripcionChange = (e) => {
    const words = e.target.value.split(/\s+/);
    if (words.length <= maxWords) {
      setDescripcion(e.target.value);
    }
  };

  /*AGREGADO DULCE*/
  const handlePersonaAsignadaChange = (event) => {
    setPersonaAsignada(event.target.value); // Actualiza la persona asignada
  };

  const [workspace, setWorkspace] = useState({
    nombre: "Arqui Web",
    usuarios: [
      { nombre: "AGONZALEZ", avatar: null }, // Avatar puede ser null para usar iniciales
      { nombre: "DALVAREM", avatar: null },
      { nombre: "BAZUAGA", avatar: null },
      { nombre: "AMARTINEZ", avatar: null },
    ]
  });

  const getInitials = (nombre) => {
    return nombre
        .split(" ")
        .map((n) => n[0])
        .join("");
  }

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
        console.log("Respuesta del backend al crear subtarea:", data);

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

  /*ESTE NO SE SI YA TENIAN MAS ARRIBA*/
  const handleEditListName = (index) => {
    setEditingListIndex(index);
    setIsEditingListName(true);
    setListName(lists[index].name);
  };

  const handleSaveListName = (index) => {
    const updatedLists = [...lists];
    updatedLists[index].name = listName;
    setLists(updatedLists);
    setIsEditingListName(false);
    setEditingListIndex(null);
  };

// Función para iniciar el arrastre de una tarjeta
  const handleDragStart = (listIndex, cardIndex) => {
    setDraggedCard({ listIndex, cardIndex });
  };

// Función para soltar la tarjeta en una lista de destino
  const handleDragOver = (event) => {
    event.preventDefault(); // Necesario para permitir el drop
  };

  const handleDrop = (targetListIndex) => {
    if (!draggedCard) return;

    const { listIndex, cardIndex } = draggedCard;
    const updatedLists = [...lists];

    // Remueve la tarjeta de la lista original
    const [movedCard] = updatedLists[listIndex].cards.splice(cardIndex, 1);

    // Agrega la tarjeta a la lista de destino
    updatedLists[targetListIndex].cards.push(movedCard);

    setLists(updatedLists);
    setDraggedCard(null);
  };

  // Función para actualizar los filtros
  const handleFiltroChange = (key, value) => {
    setFiltros((prevFiltros) => ({ ...prevFiltros, [key]: value }));
  };

  const handleCloseSubtareaModal = () => {
    setSelectedSubtarea(null);
    setShowSubtareaModal(false);
  };

  /*MODIFICACION DE NOMBRE DE TARJETA COMIENZA ACA*/
  const handleNameChange = (e) => {
    setCardName(e.target.value);
  };

  const updateCardName = (newName) => {
    if (!selectedCard) return;

    const updatedLists = [...lists];
    const { listIndex, cardIndex } = selectedCard;

    if (updatedLists[listIndex]?.cards[cardIndex]) {
      updatedLists[listIndex].cards[cardIndex].name = newName;
      setLists(updatedLists); // Actualiza la lista global
      setSelectedCard({ ...selectedCard, name: newName }); // Actualiza la tarjeta seleccionada
    } else {
      console.error('La tarjeta seleccionada no es válida.');
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (cardName !== selectedCard?.name) {
      updateCardName(cardName); // Llama a la función para actualizar el nombre
      saveCardNameToBackend(selectedCard.codTarjeta, cardName); // Guarda en el backend
     /* setSelectedCard({ ...selectedCard, nom_tarjeta: cardName });*/
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    }
  };

  const saveCardNameToBackend = async (codTarjeta, newName) => {
    try {
      const response = await fetch(`/api/tarjetas/${codTarjeta}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nom_tarjeta: newName, // Aquí envías solo el campo que se editó
        }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la tarjeta en el backend");
      }

      const data = await response.json();
      console.log("Tarjeta actualizada en el backend:", data);
      updateCardInLists(codTarjeta, data);
    } catch (error) {
      console.error("Error al guardar el nombre de la tarjeta:", error);
    }
  };


  // Función centralizada para aplicar filtros
  const aplicarFiltros = (cards, filtros) => {
    return cards.filter((card) =>
        Object.keys(filtros).every((key) =>
            filtros[key] ? card[key] === filtros[key] : true
        )
    );
  };

  /*FIN*/


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
      // Verificar en que cod_tablero se estan creando las listas
      console.log("cod_tablero de listas: ", cod_tablero)
      try {
        const response = await fetch(`http://localhost:8000/api/tableros/listas/obtener_listas_tableros/${cod_tablero}/`);
        if (response.ok) {
          const data = await response.json();
          const updatedLists = await Promise.all(data.listas.map(async (lista) => {
            // Obtener las tarjetas de cada lista
            const cardsResponse = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/obtener_tarjetas/${lista.cod_lista}/`);
            const cardsData = await cardsResponse.json();

            // Obtener las tareas para cada tarjeta de la lista
            const updatedCards = await Promise.all(cardsData.tarjetas.map(async (card) => {
              const tasksResponse = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/tareas/obtener_tarea/${card.cod_tarjeta}/`);
              const tasksData = await tasksResponse.json();

              console.log("Tareas obtenidas para la tarjeta:", tasksData);

              return { ...card, subtareas: tasksData.tareas || [] }; // Asigna las tareas a la tarjeta
            }));
            return {
              cod_lista: lista.cod_lista,
              name: lista.nom_lista,
              // cards: cardsData.tarjetas || []
              cards: updatedCards, // Tarjetas con tareas
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

  const updateCardInLists = (codTarjeta, updatedCard) => {
    const updatedLists = lists.map((list) => ({
      ...list,
      cards: list.cards.map((card) =>
          card.cod_tarjeta === codTarjeta ? { ...card, ...updatedCard } : card
      ),
    }));
    setLists(updatedLists);
  };


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


  const handleAddSubtarea = async () => {

    if (newSubtarea.trim() !== '' && selectedCard) {
      try {
        const response = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/tareas/crear_tarea/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            descripcion: newSubtarea,
            estado: 'Abierto',
            cod_tarjeta: selectedCard.cod_tarjeta,
            fec_vencimiento: "2024-12-31",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const updatedLists = [...lists];
          const { listIndex, cardIndex } = selectedCard;
          if (!updatedLists[listIndex].cards[cardIndex].subtareas) {
            updatedLists[listIndex].cards[cardIndex].subtareas = [];
          }
          updatedLists[listIndex].cards[cardIndex].subtareas.push(data);
          setLists(updatedLists);
          setNewSubtarea('');
        } else {
          console.error('Error al crear la tarea:', response.statusText);
        }
      } catch (error) {
        console.error('Error en la conexión:', error);
      }
    } else {
      alert('Escribe una descripción para la subtarea.');
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
         // setCreatedDate(getCurrentDate());  // Establece la fecha de creación
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

  const updateCardState = async (codTarjeta, newState) => {
    try {
      const response = await fetch(`http://localhost:8000/api/tableros/listas/tarjetas/actualizar_tarjeta/${codTarjeta}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: newState, // Envía el nuevo estado
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Estado de la tarjeta actualizado:", data);

        // Actualiza el estado en el frontend
        updateCardInLists(codTarjeta, data);
      } else {
        console.error("Error al actualizar el estado de la tarjeta:", response.statusText);
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la tarjeta:", error);
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
      setCardName(selectedCard.nom_tarjeta || ""); // Sincroniza el nombre de la tarjeta
      setCreatedDate(selectedCard.fec_creacion || "No disponible");
      setSubtareas(Array.isArray(selectedCard.subtareas) ? selectedCard.subtareas : []);
      setShowModal(true);
    } else {
      console.error('No se encontró la tarjeta.');
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
    /*AGREGADO DULCE*/
    setWarningMessage(""); // Limpia el mensaje de advertencia al cerrar el modal
    /*FIN*/
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

  const handleUpdateCard = async (cod_tarjeta) => {
    try {
      const updatedData = {
        nom_tarjeta: selectedCard?.name, // O lo que sea necesario actualizar
        descripcion: descripcion, // O cualquier otro campo
        usu_encargado: personaAsignada, // Persona asignada
        fec_vencimiento: modifiedDate instanceof Date
            ? modifiedDate.toISOString().split('T')[0] // Convierte la fecha al formato YYYY-MM-DD
            : null,
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

  return (
      <div className="tableros-container">
        <div className="tablero-header">
          <div className="tablero-solapa">
            {title}
          </div>
          <div className="dashboard-button-container">
            <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
              Ir al Dashboard
            </button>
          </div>
          <div className="tablero-filtro">
            <label>
              Filtrar por usuario:
              <select
                  value={filtros.usuario}
                  onChange={(e) => handleFiltroChange('usuario', e.target.value)}
              >
                <option value="">Todos los usuarios</option>
                {workspace.usuarios.map((usuario, index) => (
                    <option key={index} value={usuario.nombre}>
                      {usuario.nombre}
                    </option>
                ))}
              </select>
            </label>
            <label>
              Filtrar por etiqueta:
              <input
                  type="text"
                  value={filtros.etiqueta}
                  onChange={(e) => handleFiltroChange('etiqueta', e.target.value)}
                  placeholder="Escribe una etiqueta"
              />
            </label>
          </div>
          <div className="users-container">
            {workspace.usuarios.map((usuario, index) => (
                <div key={index} className="users-icon" title={usuario.nombre}>
                  {usuario.avatar ? (
                      <img src={usuario.avatar} alt={usuario.nombre} className="users-avatar"/>
                  ) : (
                      getInitials(usuario.nombre)
                  )}
                </div>
            ))}
          </div>
        </div>
        <main className="tableros-main">
          <div className="list-scroll-container">
            <div className={`list-container ${lists.length === 0 ? 'no-lists' : ''}`}>
              {lists.map((list, index) => (
                  <div
                      key={index}
                      className="list"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(index)} // Maneja el drop en esta lista
                  >
                    {isEditingListName && editingListIndex === index ? (
                        <input
                            type="text"
                            value={listName}
                            onChange={(e) => setListName(e.target.value)}
                            onBlur={() => handleSaveListName(index)}
                            autoFocus
                            className="editable-list-name"
                            placeholder={lists[index].name}
                        />
                    ) : (
                        <h3 onClick={() => handleEditListName(index)} className="list-name">{list.name}</h3>
                    )}
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
                      {aplicarFiltros(list.cards, filtros).map((card, cardIndex) => (
                          <div key={cardIndex} className="card" draggable onDragStart={() => handleDragStart(index, cardIndex)} onClick={() => handleCardClick(index, cardIndex)}>
                            {card.etiqueta && (
                                <div className="etiqueta"
                                     style={{background: card.etiquetaColor || 'linear-gradient(135deg, #B993D6 0%, #8CA6DB 100%)'}}>
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
                            <button className="add-card-button" onClick={() => handleAddCard(index)}>Añadir tarjeta
                            </button>
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
          </div>
        </main>
        {/* Modal para mostrar los detalles de la tarjeta */}
        <Modal show={showModal} onClose={handleCloseModal}>
          <div className="tarjeta-detalle-container">
            {/* Botón "X" para cerrar el modal */}
            <button className="close-modal-button" onClick={handleCloseModal}>X</button>
            <div className="tarjeta-cabecera">
              {isEditing ? (
                  <input
                      type="text"
                      value={cardName}
                      onChange={handleNameChange}
                      onBlur={handleBlur}
                      onKeyPress={handleKeyPress}
                      autoFocus
                      className="input-field1"
                  />
              ) : (
                  <h2 onDoubleClick={() => setIsEditing(true)}>{cardName  || 'Sin Título'}</h2>
              )}
              <select
                  id="estado"
                  name="estado"
                  className={`input-field ${selectedCard?.estado?.toLowerCase() || 'default-class'}`}
                  value={selectedCard?.estado || "P"}
                  onChange={async (e) => {
                    const newState = e.target.value;
                    await updateCardState(selectedCard.cod_tarjeta, newState);
                    setSelectedCard({ ...selectedCard, estado: newState }); // Actualiza localmente el estado de la tarjeta
                    updateCardInLists(selectedCard.cod_tarjeta, { estado: newState });
                  }}
              >
                <option value="P">Pendiente</option>
                <option value="E">En Curso</option>
                <option value="F">Finalizado</option>
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
                            <li key={index} onClick={() => handleSubtareaClick(subtarea)}>
                              <span>{subtarea.descripcion || 'Sin descripción'}</span>
                              <span className={`estado-boton ${subtarea.estado?.toLowerCase() || 'default-class'}`}>
                                {subtarea.estado || 'Sin estado'}
                              </span>
                            </li>
                        ))}
                      </ul>
                  ) : (
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
                  <div>
                    <p1 htmlFor="personaAsignada">Persona Asignada:</p1>
                    <select
                        id="personaAsignada"
                        value={personaAsignada}
                        onChange={(e) => setPersonaAsignada(e.target.value)}
                    >
                      <option value="">Seleccione una persona...</option>
                      {workspace.usuarios.map((usuario, index) => (
                          <option key={index} value={usuario.nombre}>
                            {usuario.nombre}
                          </option>
                      ))}
                    </select>
                  </div>

                  <p1>Creado el</p1>
                  <p>{createdDate || 'No disponible'}</p>
                  <p1>Vence el</p1>
                  <DatePicker
                      id="fechaVencimiento"
                      selected={modifiedDate instanceof Date ? modifiedDate : new Date()}
                      onChange={(date) => setModifiedDate(date instanceof Date ? date : new Date())}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Selecciona una fecha"
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
        <Modal show={showSubtareaModal} onClose={handleCloseSubtareaModal}>
          <div className="subtarea-detalle-container">
            {/* Contenedor principal con diseño de columnas */}
              {/* Columna Izquierda */}
              <div className="columna-izquierda1">
                <h2>{selectedSubtarea?.descripcion || "Sin título"}</h2>
                <div className="fecha-vencimiento-container">
                  <label htmlFor="fechaVencimiento">Vence el:</label>
                  <DatePicker
                      id="fechaVencimiento"
                      selected={
                        selectedSubtarea?.fechaVencimiento
                            ? new Date(selectedSubtarea.fechaVencimiento)
                            : sumarDias(new Date(), 7)
                      }
                      onChange={(date) =>
                          setSelectedSubtarea({
                            ...selectedSubtarea,
                            fechaVencimiento: date.toISOString(),
                          })
                      }
                      dateFormat="dd/MM/yyyy HH:mm:ss"
                      showTimeSelect
                      timeFormat="HH:mm:ss"
                  />
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="columna-derecha1">
                <div className="estado-dropdown">
                  <label htmlFor="estado">Estado:</label>
                  <select
                      id="estado"
                      value={selectedSubtarea?.estado || "Pendiente"}
                      onChange={(e) =>
                          setSelectedSubtarea({ ...selectedSubtarea, estado: e.target.value })
                      }
                  >
                    <option value="Abierto">Abierto</option>
                    <option value="Cerrado">Cerrado</option>
                  </select>
                </div>
                <div className="persona-asignada-container">
                  <label htmlFor="personaAsignada">Persona Asignada:</label>
                  <select
                      id="personaAsignada"
                      value={selectedSubtarea?.persona || ""}
                      onChange={(e) =>
                          setSelectedSubtarea({ ...selectedSubtarea, persona: e.target.value })
                      }
                  >
                    <option value="">Selecciona un usuario</option>
                    {workspace.usuarios.map((usuario, index) => (
                        <option key={index} value={usuario.nombre}>
                          {usuario.nombre}
                        </option>
                    ))}
                  </select>
                </div>
              </div>
            {/* Botón para cerrar */}
            <button onClick={handleCloseSubtareaModal} className="close-subtarea-modal">
              Cerrar
            </button>
          </div>
        </Modal>
        <footer className="tableros-footer">
          <p>© TaskFlow - 2024</p>
        </footer>
      </div>
  );
};

export default Tableros;