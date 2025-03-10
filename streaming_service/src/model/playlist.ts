import { Track } from "../components/track-list/trackList";

export interface Playlist {
  id: string;
  name: string;
  imageUrl: string;
  trackCount: number;
  tracks: Track[];
}

export class Playlists {
  private playlists: Playlist[] = [];

  public getPlaylists(): Playlist[] {
    return this.playlists;
  }

  public addPlaylist(playlist: Playlist): void {
    this.playlists.push(playlist);
  }

  public getPlaylistById(id: string): Playlist | undefined {
    return this.playlists.find(playlist => playlist.id === id);
  }

  public updatePlaylist(id: string, updatedPlaylist: Playlist): void {
    this.playlists = this.playlists.map(playlist =>
      playlist.id === id ? updatedPlaylist : playlist
    );
  }
}