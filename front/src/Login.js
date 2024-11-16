import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';  // Importar los estilos


const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate(); // Crear instancia de useNavigate

  //const validUsername = 'is2';
  //const validPassword = '1234';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
  
      const data = await response.json();  // Capturar la respuesta del backend
  
      if (response.ok) {
        // Login exitoso
        console.log('Login exitoso:', data);
        // Almacenar en el localStorage
        localStorage.setItem('cod_usuario', data.cod_usuario); // Almacena el cod_usuario
        localStorage.setItem('nombre', data.nombre); // Almacena el nombre de usuario
        console.log('cod_usuario:', data.cod_usuario)
        console.log('nombre:', data.nombre)
        onLogin();  // Cambiar el estado de autenticación en App.js
        navigate('/workspace');  // Redirigir al workspace
      } else {
        // Mostrar el mensaje de error si la respuesta no fue exitosa
        setErrorMessage(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
      setErrorMessage('Ocurrió un error al intentar iniciar sesión.');
    }
  };
  
  

  useEffect(() => {
    window.google.accounts.id.initialize({
      client_id: '803348551466-oboa8q0363scjbhe6rp16nakdo999mar.apps.googleusercontent.com',
      callback: handleGoogleSignIn,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-sign-in-button'),
      { theme: 'outline', size: 'large' }
    );
  }, []);

  const handleGoogleSignIn = (response) => {
    console.log('Google Sign-In response:', response);
    // Maneja la respuesta de Google Sign-In aquí
  };

  return (
    <div className="login-container">
      <div className="left-side">
        <h1 className="title">TaskFlow</h1>
        <img src="/img2cohete.png" alt="Cohete" className="rocket-image" />
      </div>
      <div className="right-side">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Iniciar Sesión</h2>
  
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mostrar mensaje de error */}
          
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Ingresar</button>
        </form>
        <div className="signup-link">
          <p>¿No tienes una cuenta? <a href="/signup">Regístrate aquí</a></p>
        </div>
        <div id="google-sign-in-button" className="google-sso"></div>
      </div>
    </div>
  );
  
};

export default Login;
