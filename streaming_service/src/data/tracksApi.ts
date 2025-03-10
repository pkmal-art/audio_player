

// import axios from 'axios';
// import { Track } from "../components/track-list/trackList";

// // Переменная для хранения треков
// export let tracksApi: Track[] = [];

// // Функция для получения треков с сервера
// export async function fetchTracks(): Promise<Track[]> {
//   try {
//     const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBvIiwiaWQiOjEsImlhdCI6MTcyNDgzNjQ0MCwiZXhwIjoxNzI1NDQxMjQwfQ.XTn_hgBnfGxdWi867w612VQFX3049riW1RV1Hy9rkyE'; // Замените на актуальный токен
//     const response = await axios.get('http://localhost:3000/api/songs', { // Укажите правильный URL вашего API
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     // Сохраняем треки в экспортируемой переменной
//     tracksApi = response.data;

//     return tracksApi;
//   } catch (error) {
//     console.error('Ошибка при получении треков с сервера:', error);
//     return [];
//   }
// }