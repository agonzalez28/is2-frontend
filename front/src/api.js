import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/tableros/listas/', // Cambia por tu URL base
});

export default api;