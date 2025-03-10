import axios from 'axios';

export const API_BASE_URL = 'http://localhost:3000'; // Укажите базовый URL вашего API

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBvIiwiaWQiOjEsImlhdCI6MTcyNjA1MTI4NywiZXhwIjoxNzI2NjU2MDg3fQ.1li94Nmufq-TEZkSPRFjeY-WJH0fu8MoPfMsuAPhWNk';

// Функция для получения списка плейлистов
export const fetchUserPlaylists = async () => {
  try {
    const response = await axios.get('/api/users/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data; 
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }
};

// Функция для получения треков
export const fetchTracks = async () => {
  try {
    const response = await axios.get('/api/songs', { 
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;    
  } catch (error) {
    console.error('Ошибка при получении треков с сервера:', error);
    throw error; 
  }
}

// Функция для добавления лайка треку
export async function likeTrack(trackId: number): Promise<void> {
  const url = `http://localhost:3000/api/songs/${trackId}/like`;

  try {
      const response = await fetch(url, {
          method: 'POST',
          headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
          },
          body: '' 
      });
            
      console.log('Track liked successfully.');
  } catch (error) {
      console.error('Error liking track:', error);
  }
}

// Функция для снятия лайка с трека
export async function unlikeTrack(trackId: number): Promise<void> {
  const url = `http://localhost:3000/api/songs/${trackId}/unlike`;

  try {
    const response = await axios.post(url, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('Track unliked successfully.');
  } catch (error) {
    console.error('Error unliking track:', error);
    throw error;
  }
}

// Функция для получения конкретного плейлиста
export const fetchPlaylist = async (playlistId: number) => {
  try {
    const response = await axios.get(`/api/playlists/${playlistId}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching playlist:', error);
    throw error; 
  }
};

// Функция для добавления трека в плейлист
export const addTrackToPlaylist = async (playlistId: number, songId: number): Promise<void> => {
  try {
    const response = await axios.post(`/api/playlists/${playlistId}/add/${songId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log(`Track ${songId} successfully added to playlist ${playlistId}.`);
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    throw error;
  }
};

// Функция для удаления трека из плейлиста
export const removeTrackFromPlaylist = async (playlistId: number, songId: number): Promise<void> => {
  try {
    const response = await axios.post(`/api/playlists/${playlistId}/remove/${songId}`, {}, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });


    console.log(`Track ${songId} successfully removed from playlist ${playlistId}.`);
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    throw error; 
  }
};
