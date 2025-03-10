import { Track } from "../components/track-list/trackList";

export interface Playlist {
  id: string;
  name: string;
  imageUrl: string;
  trackCount: number;
  tracks: Track[];
}

export class PlaylistModel {
  private playlists: Playlist[] = [];
  private filter: string = '';

  public setPlaylists(playlists: Playlist[]): void {
    this.playlists = playlists;
  }

  public setFilter(query: string): void {
    this.filter = query;
  }

  public getPlaylists(): Playlist[] {
    if (!this.filter) {
      return this.playlists;
    }

    return this.playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(this.filter)
    );
  }
}