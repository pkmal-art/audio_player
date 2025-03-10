// import axios from 'axios';

// // Укажите базовый URL вашего API
// export const API_BASE_URL = 'http://localhost:3000';

// axios.defaults.baseURL = API_BASE_URL;
// axios.defaults.headers.common['Content-Type'] = 'application/json';

// /**
//  * Создает и отправляет `n` плейлистов на сервер.
//  * @param numberOfPlaylists - Количество плейлистов для создания.
//  * @param accessToken - Токен авторизации.
//  */
// export const createAndSavePlaylists = async (numberOfPlaylists: number, accessToken: string) => {
//   // Создаем массив плейлистов
//   const playlists = Array.from({ length: numberOfPlaylists }, (_, index) => ({
//     name: `Playlist ${index + 1}`, // Название плейлиста
//     description: `Description for playlist ${index + 1}` // Описание плейлиста (можно изменить)
//   }));

//   try {
//     // Отправляем запрос на сервер для создания плейлистов
//     const response = await axios.post('/api/playlists', playlists, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     console.log('Playlists created successfully:', response.data);
//     return response.data; // Возвращаем данные с сервера (например, список созданных плейлистов)
//   } catch (error) {
//     console.error('Error creating playlists:', error);
//     throw error; // Передаем ошибку дальше
//   }
// };
