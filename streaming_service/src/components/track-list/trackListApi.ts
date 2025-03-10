import { Component } from '../components';
import { Sidebar } from '../sidebar/sidebar';
import { UserAction } from '../../model/userActions';
import { Playlists } from '../playlists/playlists';


export interface TrackApi {
  id: number;
  name: string;
  filename:string;
  path: string;
  image: string;
  duration: number;
  createAd: string;
  album: Album;
  artist: Artist;
  playlists: Playlists;
  likes: Likes;
}

export interface Album {
  id: number;
  name: string;
  image: string;
  createdAt: string;
}

export interface Artist {
  id: number;
  name: string;
  image: string;
  createdAt: string;
}

export interface Likes {
  likes: number;
}



export class TrackListApi extends Component {
  constructor(
    private tracks: TrackApi[], 
    private onLikeButtonClick: (updatedTrack: TrackApi) => void,
    private onAction: (action: UserAction, track: TrackApi) => void 
  ) {
    super();
    this.updateFavoriteStatus();
  }

  getTemplate(): string {
    return `
      <h2 class="tracks__h2 title__h2">Треки</h2>
      <div class="tracks__content">
        <div class="tracks__header flex">
          <div class="tracks__header__number">№</div>
          <div class="tracks__header__name">НАЗВАНИЕ</div>
          <div class="tracks__header__albom">АЛЬБОМ</div>
          <div class="tracks__header__data">
            <svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 1.5H1C0.723858 1.5 0.5 1.72386 0.5 2V12C0.5 12.2761 0.723858 12.5 1 12.5H11C11.2761 12.5 11.5 12.2761 11.5 12V2C11.5 1.72386 11.2761 1.5 11 1.5Z" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M0.5 4.5H11.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="tracks__header__time">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#A4A4A4" stroke-miterlimit="10"/>
              <path d="M7 3.5V7H10.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      <ul class="tracks__list">
        ${this.tracks.map((track, index) => 
            new TrackItemApi(track, index + 1, this.onLikeButtonClick, this.onAction).getTemplate()).join('')}
      </ul>
    `;
  }

  setEventListeners(): void {
    this.tracks.forEach((track, index) => {
      const trackItemElement = this.getElement().querySelector(`.tracks__item:nth-child(${index + 1})`) as HTMLElement;
      if (trackItemElement) {
        const trackItem = new TrackItemApi(track, index + 1, this.onLikeButtonClick, this.onAction); 
        trackItem.setEventListeners();
      }
    });
  }

  render(): void {
    const container = document.querySelector('#track-list-container'); 
    if (container) {
      container.innerHTML = this.getTemplate();
      this.setEventListeners();
    } else {
      console.error('Container element for track list not found');
    }
  }

  private updateFavoriteStatus(): void {
    this.tracks.forEach((track, index) => {
      const trackItemElement = this.getElement().querySelector(`.tracks__item:nth-child(${index + 1})`) as HTMLElement;
      if (trackItemElement) {
        const likeButton = trackItemElement.querySelector('.track__like-btn') as HTMLElement;
        //track.isFavorite = likeButton.classList.contains('like-btn--active');
      }
    });
  }
}


export class TrackItemApi extends Component {
  constructor(
    private track: TrackApi,
    private number: number,
    private onLikeButtonClick: (updatedTrack: TrackApi) => void,
    private onAction: (action: UserAction, track: TrackApi) => void
  ) {
    super();
    this.setEventListeners();
  }

  getTemplate(): string {
    return `
      <li class="tracks__item flex">
        <div class="tracks__item__number">${this.number}</div>
        <div class="tracks__item__name">
          <img class="track__img" src="${this.track.image}" alt="${this.track.name}">
          <div class="track__content">
            <h3 class="track__name"><a class="track__name__link" href="#">${this.track.name}</a></h3>
            <span class="track__author">${this.track.artist.name}</span> <!-- Обновлено на name -->
          </div>
        </div>
        <div class="tracks__item__albom">${this.track.album.name}</div> <!-- Обновлено на name -->
        <div class="tracks__item__data flex">
          <span class="data__text">${this.track.createAd}</span>
          <button class="track__like-btn">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z" fill="#FC6D3E"/>
            </svg>
          </button>
        </div>
        <time class="tracks__item__time">${this.track.duration}</time>
        <div class="tracks__item__drop">
          <button class="track__btn-dropdown">
            <svg width="23" height="4" viewBox="0 0 23 4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="2" cy="2" r="2" fill="#C4C4C4"/>
              <circle cx="11.5" cy="2" r="2" fill="#C4C4C4"/>
              <circle cx="21" cy="2" r="2" fill="#C4C4C4"/>
            </svg>
          </button>
          <div class="track__dropdown">
            <button class="track__add-btn">Добавить в плейлист</button>
            <button class="track__delete-btn">Удалить из плейлиста</button>
          </div>
        </div>
      </li>
    `;
  }

  setEventListeners(): void {
    const likeButton = this.getElement().querySelector('.track__like-btn') as HTMLElement;
    if (likeButton) {
      likeButton.addEventListener('click', () => {
        this.track.likes.likes = this.track.likes.likes ? this.track.likes.likes - 1 : 1; // Логика обновления лайков
        likeButton.classList.toggle('like-btn--active', this.track.likes.likes > 0);
        this.onLikeButtonClick(this.track); 
      });
    }

    const modalButton = this.getElement().querySelector('.track__btn-dropdown') as HTMLElement;
    if (modalButton) {
      modalButton.addEventListener('click', () => {
        this.closeOtherModals();
        const modalWindow = this.getElement().querySelector('.track__dropdown') as HTMLElement;
        modalWindow.classList.toggle('dropdown--active');
      });
    }

    const deleteButton = this.getElement().querySelector('.track__delete-btn') as HTMLElement;
    if (deleteButton) {
      deleteButton.addEventListener('click', () => {
        this.onAction(UserAction.DELETE_TRACK, this.track); 
      });
    }

    document.addEventListener('click', (event) => {
      const modalWindow = this.getElement().querySelector('.track__dropdown') as HTMLElement;
      const isClickInside = this.getElement().contains(event.target as Node);
      if (modalWindow && !isClickInside) {
        this.closeModal();
      }
    });
  }

  private closeModal(): void {
    const modalWindow = this.getElement().querySelector('.track__dropdown') as HTMLElement;
    if (modalWindow) {
      modalWindow.classList.remove('dropdown--active');
    }
  }

  private closeOtherModals(): void {
    const openModals = document.querySelectorAll('.track__dropdown.dropdown--active');
    openModals.forEach(modal => {
      (modal as HTMLElement).classList.remove('dropdown--active');
    });
  }
}