import { Component } from "../components";
//import { playlists } from '../../data/playlistData'; 
import { switchScreen, ScreenState, showFavoriteTracks } from '../../index';
import { Tracks } from '../../model/tracks';
import { fetchUserPlaylists, fetchTracks } from '../../apiService';
import { Playlist } from '../../model/playlist'; 
import { PlaylistApiModel } from '../../model/playlistApiModel'; 
import { Track } from '../track-list/trackList';

export class Playlists extends Component {
  private menuButtons: HTMLElement[];
  private tracksModel: Tracks;
  private playlistsApi: PlaylistApiModel[] = []; 
  private favoriteTracksCount: number = 0;

  constructor(tracksModel: Tracks) {
    super();
    this.menuButtons = [];
    this.tracksModel = tracksModel;
    this.init(); 
  }

  private async loadPlaylists(): Promise<void> {
    try {
      const response = await fetchUserPlaylists();
      this.playlistsApi = response; 

      await this.updateFavoriteTracksCount();

      this.updateView(); 
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }

  private async updateFavoriteTracksCount(): Promise<void> {
    try {
      const tracks: Track[] = await fetchTracks();
      this.tracksModel.setTracks(tracks);

      this.favoriteTracksCount = tracks.filter(track => track.likes && track.likes.length > 0).length;
    } catch (error) {
      console.error('Error fetching tracks for favorite count:', error);
    }
  }

  private updateView(): void {
    if (this.element) {
      this.element.innerHTML = this.getTemplate();
      this.menuButtons = Array.from(this.element.querySelectorAll('.playlist__item'));
      this.addEventListeners();
    }
  }

  getTemplate(): string {
    return `
    <div>
      <ul class="playlist__list">
        <li class="playlist__item" id="favoriteButton">
          <picture>
            <source srcset="img/playlists__360%20(1).jpg" media="(max-width: 576px)">
            <source srcset="img/playlists__1440%20(1).jpg" media="(max-width: 1440px)">
            <img class="playlist__img" src="img/playlists%20(1).jpg" alt="Любимые песни">
          </picture>
          <div class="playlist__content" id="favoriteTrack">
            <h3 class="playlist__h3"><a class="playlist__h3__link" href="#">Любимые песни</a></h3>
            <span class="playlist__count">${this.favoriteTracksCount} треков</span>
          </div>
        </li>
        
        ${this.getPlaylistButtonsApi()}
      </ul>
    </div>
    `;
  }

  private getPlaylistButtonsApi(): string {
    return this.playlistsApi.map(playlistApi => `
      <li class="playlist__item" data-playlist-id="${playlistApi.id}">
       <picture>
          <source srcset="img/playlists__1440 (4).jpg" media="(max-width: 576px)">
          <source srcset="img/playlists__1440 (4).jpg" media="(max-width: 1440px)">
          <img src="img/playlists__1440 (4).jpg" alt="${playlistApi.name}" class="playlist__img"/>
        </picture>
        <div class="playlist__content">
          <h3 class="playlist__h3"><a class="playlist__h3__link" href="#">${playlistApi.name}</a></h3>
          <span class="playlist__count">${playlistApi.songs.length} треков</span>
        </div>
      </li>
    `).join('');
  }

  async init(): Promise<void> {
    await this.loadPlaylists(); 
  }

  getElement(): HTMLElement {
    if (!this.element) {
      this.element = super.getElement();
      this.menuButtons = Array.from(this.element.querySelectorAll('.playlist__item'));
      this.addEventListeners();
    }
    return this.element;
  }

  private addEventListeners(): void {
    this.menuButtons.forEach(button => {
      const playlistId = button.dataset.playlistId;
  
      if (playlistId) {
        const numericPlaylistId = parseInt(playlistId, 10);
        if (!isNaN(numericPlaylistId)) {
          button.addEventListener('click', () => this.onPlaylistButtonClick(numericPlaylistId));
        } else {
          console.error('Invalid playlist ID');
        }
      }
    });
  
    const favoriteButton = this.element!.querySelector('#favoriteButton');
    if (favoriteButton) {
      favoriteButton.addEventListener('click', () => {
        console.log('Кнопка "Любимое" нажата');
        showFavoriteTracks();
      });
    } else {
      console.error('Кнопка "Любимое" не найдена');
    }
  }
  
  private onPlaylistButtonClick(playlistId: number): void {
    switchScreen(ScreenState.Playlist, playlistId); 
  }
}

 