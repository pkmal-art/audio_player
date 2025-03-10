import { Track } from "../components/track-list/trackList";

export interface PlaylistApiModel {
  id: number;
  name: string;
  createdAt: string;
  user: string;
  songs: Track[];
}

export class Playlists {
  private playlists: PlaylistApiModel[] = [];

  public getPlaylists(): PlaylistApiModel[] {
    return this.playlists;
  }

  public addPlaylist(playlist: PlaylistApiModel): void {
    this.playlists.push(playlist);
  }

  public getPlaylistById(id: number): PlaylistApiModel | undefined {
    return this.playlists.find(playlist => playlist.id === id);
  }

  public updatePlaylist(id: number, updatedPlaylist: PlaylistApiModel): void {
    this.playlists = this.playlists.map(playlist =>
      playlist.id === id ? updatedPlaylist : playlist
    );
  }
}