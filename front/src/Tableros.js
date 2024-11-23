import React, { useState, useEffect } from 'react';  
import { useParams, useNavigate } from 'react-router-dom';
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
  const [createdDate, setCreatedDate] = useState(''); 
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
          setLists(data.listas.map((lista) => ({
            cod_lista: lista.cod_lista,
            name: lista.nom_lista,
            cards: [] // Inicializa vacío si aún no hay tarjetas
          })));
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

  const handleDeleteList = async (codLista) => {
    if (!codLista) {
      console.error("codLista es undefined");
      return;
    }
    try {
      const response = await fetch(`http://localhost:8000/api/tableros/listas/eliminar_lista/${codLista}/`, {
        method: 'DELETE',
      });
      if (response.ok) {
        console.log("Lista eliminada exitosamente");
        // Actualiza el estado para reflejar la eliminación en la UI
        setLists(lists.filter((list) => list.cod_lista !== codLista));
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

  const handleAddCard = (index) => {
    if (cardName.trim() !== "") {
      const updatedLists = [...lists];
      updatedLists[index].cards.push({
        name: cardName,
        subtareas: [],
        etiquetaColor: getRandomGradient(),
      });
      
      const fechaModificada = sumarDias(new Date(), 7);
      setLists(updatedLists); 
      setCardName(""); 
      setShowCardInputIndex(null); 
      setCreatedDate(getCurrentDate()); 
      setModifiedDate(fechaModificada.toLocaleString());
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
      setSubtareas([...selectedCard.subtareas]);  
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
        <div className={`list-container ${lists.length === 0 ? 'empty' : ''}`}>
        {lists.length === 0 && (
          <div className="no-lists">
            <div className="add-list">
              <button onClick={() => setShowInput(!showInput)}>
                <i className={showInput ? "fas fa-times" : "fas fa-plus"}></i>
                {showInput ? 'Cancelar' : 'Añadir otra lista'}
              </button>
            </div>
          </div>
        )}
        <div className="list-scroll-container">
          <div className="list-container">
          {lists.map((list, listIndex) => (
            <div key={listIndex} className="list">
              <h3>{list.name}</h3>
              <button className="options-button" onClick={() => toggleOptions(listIndex)}>
                <i className="fas fa-ellipsis-h"></i>
              </button>
              {showOptionsIndex === listIndex && (
              <div className="options-menu-container">
                <div className="options-menu">
                  <button className="options-button" onClick={() => handleDeleteList(list.cod_lista)}>Eliminar</button>
                </div>
              </div>
              )}
              {list.cards.map((card, cardIndex) => (
                <div key={cardIndex} className="add-card-button" onClick={() => handleCardClick(listIndex, cardIndex)}>
                  <h4>{card.name}</h4>
                </div>
              ))}
              <button className="add-card-button" onClick={() => setShowCardInputIndex(listIndex)}>
               <strong> {showCardInputIndex === listIndex ? 'Cancelar' : '+ Añadir una tarjeta'}</strong>
              </button>
              {showCardInputIndex === listIndex && (
                <div className="add-card-form">
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Nombre de la tarjeta"
                  />
                  <div className="add-card-buttons">
                  <button className="add-card-button" onClick={() => handleAddCard(listIndex)}> Añadir una tarjeta </button>
                  <button className="close-button" onClick={() => setShowCardInputIndex(null)}>X</button>
                  </div>
                </div>
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
        </div>
      </main>
      <footer className="tableros-footer">
          <p>© TaskFlow - 2024</p>
        </footer>
    </div>
  );
};

export default Tableros;
