import { Component } from '../components';
import { Sidebar } from '../sidebar/sidebar';
import { UserAction } from '../../model/userActions';
import { Playlists } from '../playlists/playlists';
import { PlaylistApiModel } from '../../model/playlistApiModel';
import { fetchUserPlaylists } from '../../apiService';
import { likeTrack, unlikeTrack } from '../../apiService';
import { fetchTracks, addTrackToPlaylist, removeTrackFromPlaylist } from '../../apiService';
import { Tracks } from '../../model/tracks';
import { ScreenState } from '../../index';
//import { updateFooterPlayer } from '../../index';

export interface Track {
  id: number;
  name: string;
  filename:string;
  path: string;
  image: string;
  duration: number;
  createdAt: string;
  album: Album;
  artist: Artist;
  playlists: PlaylistApiModel;
  likes: Likes[];
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
  id: number;
  username: string;
  firstName: string;
  lastName: string;
}


export class TrackList extends Component {
  private selectTrackCallback: (track: Track) => void;
  private currentPlaylistId?: number;
  constructor(
    private tracks: Track[], 
    private onAction: (action: UserAction, track: Track) => void,
    private currentScreen: ScreenState,
    selectTrackCallback: (track: Track) => void,
    currentPlaylistId?: number  
  ) {
    super();
    this.selectTrackCallback = selectTrackCallback;
    this.currentPlaylistId = currentPlaylistId;
    this.onLikeButtonClick = this.onLikeButtonClick.bind(this);
    this.render(); 
  }

  getTemplate(): string {
    return `
      <h2 class="tracks__h2 title__h2">Треки</h2>
      <div class="tracks__content">
        <div class="tracks__header flex">
              <div class="tracks__header__number">№</div>
              <div class="tracks__header__name">НАЗВАНИЕ</div>
              <div class="tracks__header__albom">АЛЬБОМ</div>
              <div class="tracks__header__data"><svg width="12" height="13" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11 1.5H1C0.723858 1.5 0.5 1.72386 0.5 2V12C0.5 12.2761 0.723858 12.5 1 12.5H11C11.2761 12.5 11.5 12.2761 11.5 12V2C11.5 1.72386 11.2761 1.5 11 1.5Z" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M3 0.5V2.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M0.5 4.5H11.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              </div>
              <div class="tracks__header__time"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="#A4A4A4" stroke-miterlimit="10"/>
<path d="M7 3.5V7H10.5" stroke="#A4A4A4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
              </div>
            </div>
      </div>
      <ul class="tracks__list">
      ${this.tracks.map((track, index) => 
        new TrackItem(
          track, 
          index + 1, 
          this.onLikeButtonClick, 
          this.onAction, 
          this.selectTrackCallback, // Передаем selectTrackCallback
          'Po', // имя пользователя
          this.currentScreen, 
          this.currentPlaylistId // Передаем playlistId (если есть)
        ).getTemplate()
      ).join('')}
      </ul>
    `;
  }

  onLikeButtonClick(): void {
    console.log('click');
      this.render();
  }

  render(): void {
 
    const container = document.querySelector('.tracks__list-container'); 
    if (container) {
      container.innerHTML = this.getTemplate(); 
    } else {
      console.error('Container element for track list not found');
    }
  }
}

export class TrackItem extends Component {
  constructor(
    private track: Track,
    private number: number,
    private onLikeButtonClick: (updatedTrack: Track) => void,
    private onAction: (action: UserAction, data: any) => void,
    private selectTrackCallback: (track: Track) => void,
    private currentUserName: string, 
    private screenState: ScreenState,   
    private playlistId?: number  
  ) {
    super();
    this.setEventListeners();
  }

  getTemplate(): string {
    const daysAgoText = this.getDaysAgoText(this.track.createdAt); 
    const formattedDuration = this.formatDuration(this.track.duration);
    const isLikedByCurrentUser = this.track.likes.some((like) => like.username === this.currentUserName);
   
    const deleteButtonHTML = this.screenState === ScreenState.Playlist ? `
      <button class="track__delete-btn">Удалить из плейлиста</button>
    ` : '';
  
  
    return `
      <li class="tracks__item flex" id="trackId-${this.track.id}">
        <div class="tracks__item__number">${this.number}</div>
        <div class="tracks__item__name">
          <img class="track__img" src="${this.track.image}" alt="${this.track.name}">
          <div class="track__content">
            <h3 class="track__name"><a class="track__name__link" href="#">${this.track.name}</a></h3>
            <span class="track__author">${this.track.artist.name}</span>
          </div>
        </div>
        <div class="tracks__item__albom">${this.track.album.name}</div>
        <div class="tracks__item__data flex">
          <span class="data__text">${daysAgoText}</span>
          <button class="track__like-btn ${isLikedByCurrentUser ? 'like-btn--active' : ''}" id="${this.track.id}">
            <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z" fill="#FC6D3E"/>
            </svg>
          </button>
        </div>
        <time class="tracks__item__time">${formattedDuration}</time>
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
            ${deleteButtonHTML} <!-- Вставляем кнопку удаления условно -->
          </div>
        </div>
      </li>
    `;
  }

  private getDaysAgoText(createdAt: string): string {
    const createdDate = new Date(createdAt); 
    const currentDate = new Date(); 
    const differenceInTime = currentDate.getTime() - createdDate.getTime(); 
    const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24)); 
  
    if (differenceInDays === 0) {
      return 'Сегодня';
    } else if (differenceInDays === 1) {
      return 'Вчера';
    } else {
      return `${differenceInDays} дн. назад`;
    }
  }

  private formatDuration(durationMs: number): string {
   
    const durationSec = Math.floor(durationMs / 1000);
   
    const minutes = Math.floor(durationSec / 60);
    const seconds = durationSec % 60;
   
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


 setEventListeners(): void {
  const trackElement = this.getElement();
  if (!trackElement) return;

  trackElement.addEventListener('click', (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    // Проверяем, был ли клик по кнопке лайка или модального окна
    if (target.closest('.track__like-btn') || target.closest('.track__btn-dropdown') || target.closest('.track__dropdown')) {
      // Не переключаем трек, если клик был по лайку или модальному окну
      return;
    }

    // Если клик был не по лайку или модальному окну, переключаем трек
    this.selectTrackCallback(this.track);
  }); 

  const likeButton = trackElement.querySelector('.track__like-btn') as HTMLElement;
  if (likeButton) {
    likeButton.addEventListener('click', async () => {
      
      
      if (likeButton.classList.contains('like-btn--active')) {       
        await unlikeTrack(this.track.id);
        likeButton.classList.remove('like-btn--active'); 
      } else {      
        await likeTrack(this.track.id);
        likeButton.classList.add('like-btn--active'); 
      }
      
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

    const addButton = this.getElement().querySelector('.track__add-btn') as HTMLElement;
    if (addButton) {
      addButton.addEventListener('click', () => {
        this.openSidebarModal();
      });
    }

    const deleteButton = this.getElement().querySelector('.track__delete-btn') as HTMLElement;
if (deleteButton) {
  deleteButton.addEventListener('click', async () => {
    console.log(this.playlistId);
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6IlBvIiwiaWQiOjEsImlhdCI6MTcyNTQ0MTY0NSwiZXhwIjoxNzI2MDQ2NDQ1fQ.vX1hYo-E6Yq6ospwPRfXzz_GZoL74-zWLUghsAS54vc';
    
    try {
      
      if (this.playlistId) {
        console.log(`Attempting to remove track ${this.track.id} from playlist ${this.playlistId}...`);

        
        await removeTrackFromPlaylist(this.playlistId, this.track.id);

        console.log(`Track ${this.track.id} successfully removed from playlist ${this.playlistId}.`);
        
        removeTrackFromUI(this.track.id);
        //this.onAction(UserAction.DELETE_TRACK, this.track);
      } else {
        console.warn('No playlist ID specified. Unable to remove track from playlist.');
      }

    } catch (error) {
      console.error('Error while removing track from the playlist:', error);
    }
  });
}

    function removeTrackFromUI(trackId: number): void {
      const trackElement = document.getElementById(`trackId-${trackId}`);
      if (trackElement) {
        trackElement.remove();
        console.log(`Track ${trackId} removed from UI.`);
      } else {
        console.error(`Track element with ID track-${trackId} not found.`);
      }
    }

    document.addEventListener('click', (event) => {
      const modalWindow = this.getElement().querySelector('.track__dropdown') as HTMLElement;
      const isClickInside = this.getElement().contains(event.target as Node);
      if (modalWindow && !isClickInside) {
        this.closeModal();
      }
    });
  }

  render(): void {
  
    const container = document.querySelector('.tracks__list-container'); 
    if (container) {
      container.innerHTML = this.getTemplate(); 
    } else {
      console.error('Container element for track list not found');
    }
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

    private openSidebarModal(): void {
    const modalElement = document.querySelector('.playlists-modal') as HTMLElement;
    const playlistContentElement = document.getElementById('playlistContent') as HTMLElement;
    
    if (playlistContentElement && modalElement) {
      // Загружаем плейлисты с сервера
      fetchUserPlaylists().then((playlists) => { 
        const sidebar = new Sidebar(this.track, playlists); 

        playlistContentElement.innerHTML = sidebar.getTemplate();
        sidebar.addEventListeners();
        modalElement.classList.add('show');

        const closeButton = modalElement.querySelector('.playlists-modal__close-btn') as HTMLElement;
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            modalElement.classList.remove('show');
          });
        }
      }).catch(error => {
        console.error('Ошибка при загрузке плейлистов:', error);
      });
    } else {
      console.error('Modal or playlist content element not found.');
    }
  }
}


