// import axios from 'axios';
// import { Playlist } from '../model/playlist';

// // Переменная для хранения плейлистов
// export let playlistsApi: Playlist[] = [];
// export const API_BASE_URL = 'http://localhost:3000'; // Укажите базовый URL вашего API

// axios.defaults.baseURL = API_BASE_URL;
// axios.defaults.headers.common['Content-Type'] = 'application/json';

// // Функция для получения списка плейлистов

// export const fetchPlaylists = async () => {
//   try {
//     const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBvIiwiaWQiOjEsImlhdCI6MTcyNDgzNjQ0MCwiZXhwIjoxNzI1NDQxMjQwfQ.XTn_hgBnfGxdWi867w612VQFX3049riW1RV1Hy9rkyE'; // Замените на актуальный токен
//     const response = await axios.get('/api/users/playlists', {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });
//     playlistsApi = response.data; // Возвращаем данные с сервера
//     return playlistsApi;
//   } catch (error) {
//     console.error('Error fetching playlists:', error);
//     throw error;
//   }
// };