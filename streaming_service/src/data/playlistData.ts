// ./data/playlistData.ts



import { PlaylistApiModel } from '../model/playlistApiModel';
import { fetchUserPlaylists } from '../apiService'; 

export async function initPlaylists(): Promise<PlaylistApiModel[]> {
   try {
    const playlists = await fetchUserPlaylists(); 
    console.log('Loaded playlists:', playlists);
    return playlists;
  } catch (error) {
    console.error('Error loading playlists:', error);
    return []; 
  }
}