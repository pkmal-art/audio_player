import { Component } from "../components";
//import { playlists } from "../../data/playlistData"; 
import { fetchUserPlaylists } from '../../apiService';
import { Playlist } from '../../model/playlist';
import { PlaylistApiModel } from '../../model/playlistApiModel';
import { ScreenState, switchScreen } from '../../index';

export class PlaylistPage extends Component {
  private menuButtons: HTMLElement[] = [];
  private playlistsApi: PlaylistApiModel[] = []; 
  private currentScreen: ScreenState = ScreenState.Tracks;

  constructor() {
    super();
  }

  async init(): Promise<void> {
    await this.loadPlaylists();
    switchScreen(this.currentScreen); 
  }

  private async loadPlaylists(): Promise<void> {
    try {
      const response = await fetchUserPlaylists();
      this.playlistsApi = response; 
      this.updateView(); 
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  }

  private updateView(): void {
    if (this.element) {
      this.element.innerHTML = this.getTemplate(); 
      this.addEventListeners(); 
    }
  }

  getTemplate(): string {
    return `
      <ul class="aside__list">
        <li class="aside__item">
          <button id="tracksButton" class="aside__btn aside__tabs-btn aside__btn-active" data-path="tracks">
          <svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.5 22C22.433 22 24 20.433 24 18.5C24 16.567 22.433 15 20.5 15C18.567 15 17 16.567 17 18.5C17 20.433 18.567 22 20.5 22Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.5 26C6.433 26 8 24.433 8 22.5C8 20.567 6.433 19 4.5 19C2.567 19 1 20.567 1 22.5C1 24.433 2.567 26 4.5 26Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M24 7L8 11" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 22.5V5L24 1V18.5" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="aside__btn__text">Треки</span>
          </button>
        </li>
        <li class="aside__item">
          <button id="playlistsButton" class="aside__btn aside__tabs-btn" data-path="playlists">
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.5185 12.1467L2.52146 1.14814C2.36988 1.0555 2.19634 1.00492 2.01872 1.00159C1.8411 0.998268 1.6658 1.04232 1.51085 1.12922C1.3559 1.21612 1.2269 1.34273 1.13711 1.49602C1.04733 1.64932 1 1.82376 1 2.00142V23.9986C1 24.1762 1.04733 24.3507 1.13711 24.504C1.2269 24.6573 1.3559 24.7839 1.51085 24.8708C1.6658 24.9577 1.8411 25.0017 2.01872 24.9984C2.19634 24.9951 2.36988 24.9445 2.52146 24.8519L20.5185 13.8533C20.6647 13.7639 20.7855 13.6386 20.8693 13.4891C20.9531 13.3397 20.9971 13.1713 20.9971 13C20.9971 12.8287 20.9531 12.6603 20.8693 12.5108C20.7855 12.3614 20.6647 12.2361 20.5185 12.1467Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="aside__btn__text">Плейлисты</span>
          </button>
        </li>
        <li class="aside__item">
          <button class="aside__btn" id="favorite">Любимые песни</button>
        </li>
        ${this.getPlaylistButtonsApi()}
      </ul>
    `;
  }

  private getPlaylistButtonsApi(): string {
    return this.playlistsApi.map(playlistApi => `
      <li class="aside__item">
        <button class="aside__btn" data-playlist-id="${playlistApi.id}">
          ${playlistApi.name}
        </button>
      </li>
    `).join('');
  }

  getElement(): HTMLElement {
    const element = super.getElement(); 
    this.element = element; 
    this.init(); 
    return element;
  }

  private addEventListeners(): void {
    const tracksButton = this.element?.querySelector('#tracksButton') as HTMLElement | null;
    const playlistsButton = this.element?.querySelector('#playlistsButton') as HTMLElement | null;
    const favoriteButton = this.element?.querySelector('#favorite') as HTMLElement | null;
  
    if (tracksButton) {
      tracksButton.addEventListener('click', () => {
        this.setActiveTab(tracksButton);
        this.currentScreen = ScreenState.Tracks;
        switchScreen(ScreenState.Tracks);
      });
    }
  
    if (playlistsButton) {
      playlistsButton.addEventListener('click', () => {
        this.setActiveTab(playlistsButton);
        this.currentScreen = ScreenState.PlaylistList;
        switchScreen(ScreenState.PlaylistList);
      });
    }
  
    if (favoriteButton) {
      favoriteButton.addEventListener('click', () => {
        this.setActiveTab(favoriteButton);
        this.currentScreen = ScreenState.FavoriteTracks;
        switchScreen(ScreenState.FavoriteTracks);
      });
    }
  
    this.menuButtons = Array.from(this.element?.querySelectorAll('.aside__btn') || []) as HTMLElement[];
    this.menuButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const playlistId = target.dataset.playlistId;
  
        if (playlistId) {
          const numericPlaylistId = parseInt(playlistId, 10);
          if (!isNaN(numericPlaylistId)) {
            this.onPlaylistButtonClick(numericPlaylistId);
            this.setActiveTab(target); // Устанавливаем активную вкладку
          } else {
            console.error('Invalid playlist ID');
          }
        }
      });
    });
  }

  private onPlaylistButtonClick(playlistId: number): void {
    switchScreen(ScreenState.Playlist, playlistId); 
  }

  // Метод для установки активной вкладки
  private setActiveTab(activeButton: HTMLElement): void {
    // Убираем класс 'aside__btn-active' у всех кнопок
    this.menuButtons.forEach(button => {
      button.classList.remove('aside__btn-active');
    });
    // Добавляем класс только активной кнопке
    activeButton.classList.add('aside__btn-active');
  }
}

/*
export function createPlaylistPage(): string {
  return `
    <ul class="aside__list">
      <li class="aside__item">
        <button class="aside__btn aside__tabs-btn aside__btn-active" data-path="tracks"><svg width="25" height="27" viewBox="0 0 25 27" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5 22C22.433 22 24 20.433 24 18.5C24 16.567 22.433 15 20.5 15C18.567 15 17 16.567 17 18.5C17 20.433 18.567 22 20.5 22Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M4.5 26C6.433 26 8 24.433 8 22.5C8 20.567 6.433 19 4.5 19C2.567 19 1 20.567 1 22.5C1 24.433 2.567 26 4.5 26Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M24 7L8 11" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 22.5V5L24 1V18.5" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="aside__btn__text">Треки</span>
        </button>
      </li>
      <li class="aside__item">
        <button class="aside__btn aside__tabs-btn" data-path="playlists"><svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.5185 12.1467L2.52146 1.14814C2.36988 1.0555 2.19634 1.00492 2.01872 1.00159C1.8411 0.998268 1.6658 1.04232 1.51085 1.12922C1.3559 1.21612 1.2269 1.34273 1.13711 1.49602C1.04733 1.64932 1 1.82376 1 2.00142V23.9986C1 24.1762 1.04733 24.3507 1.13711 24.504C1.2269 24.6573 1.3559 24.7839 1.51085 24.8708C1.6658 24.9577 1.8411 25.0017 2.01872 24.9984C2.19634 24.9951 2.36988 24.9445 2.52146 24.8519L20.5185 13.8533C20.6647 13.7639 20.7855 13.6386 20.8693 13.4891C20.9531 13.3397 20.9971 13.1713 20.9971 13C20.9971 12.8287 20.9531 12.6603 20.8693 12.5108C20.7855 12.3614 20.6647 12.2361 20.5185 12.1467Z" stroke="#FC6D3E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="aside__btn__text">Плейлисты</span>
        </button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Любимые песни</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #1</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #2</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #3</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #4</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #5</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #6</button>
      </li>
      <li class="aside__item">
        <button class="aside__btn">Плейлист #7</button>
      </li>
    </ul>
  `;
}
  */
