import { Component } from "../components";
import { Track } from '../track-list/trackList';

export class PlaylistTracks extends Component {
  private tracks: Track[];

  constructor(tracks: Track[]) {
    super();
    this.tracks = tracks;
  }

  getTemplate(): string {
    return `
      <div class="playlist-tracks">
        <h2>Треки плейлиста</h2>
        <ul>
          ${this.tracks.map(track => `
            <li>${track.name} - ${track.artist.name}</li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}