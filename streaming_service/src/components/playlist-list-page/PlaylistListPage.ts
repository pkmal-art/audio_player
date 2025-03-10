import { Component } from "../components";
import { Playlist } from '../../model/playlist';

export class PlaylistListPage extends Component {
  private playlist: Playlist;
  constructor() {
    super();
  }

  getTemplate(): string {
    return `
      <section class="playlist-list">
        <h2>Список плейлистов</h2>
        <ul class="playlist-list__items">
          <!-- Список плейлистов будет здесь -->
        </ul>
      </section>
    `;
  }

  updatePlaylist(playlist: Playlist): void {
    this.playlist = playlist;
    
  }
}