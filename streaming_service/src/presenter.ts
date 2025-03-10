// import { Tracks } from './model/tracks';
// import { PlaylistTracks } from './model/playlistTrack';
// import { Track } from "./components/track-list/trackList";
// import { UserAction } from './model/userActions';
// import { TrackListPresenter } from './presenters/TrackListPresenter';
// import { PlaylistPage } from './components/playlist-page/playlistPage';
// import { Playlist } from './model/playlist';
// import { mockTracks } from './data/tracks';
// import { Sidebar } from "./components/sidebar/sidebar";
// import { playlists } from './data/playlistData';  

// export class Presenter {
//   private playlistTracksModel = new PlaylistTracks();
//   private playlists: Playlist[] = playlists;  

//   private currentPlaylistId: string | null = null; 
//   private selectedTrack: Track | null = null;

//   constructor(private tracksModel: Tracks) {
//     this.initializeEventListeners();
//   }

//   private getCurrentPlaylistId(): string {
//     if (this.currentPlaylistId) {
//       return this.currentPlaylistId;
//     }
//     console.error('Текущий плейлист не установлен');
//     return '1'; 
//   }

//   private handlePlaylistSelect(playlistId: string): void {
//     this.currentPlaylistId = playlistId; 
//     this.renderTracks(this.getTracksForCurrentPlaylist());
//   }

//   private getTracksForCurrentPlaylist(): Track[] {
//     const currentPlaylistId = this.getCurrentPlaylistId();
//     const selectedPlaylist = this.playlists.find(playlist => playlist.id === currentPlaylistId);
//     return selectedPlaylist ? selectedPlaylist.tracks : [];
//   }

//   public init(): void {
    
//     const tracks = this.tracksModel.getTracks();
//     this.renderTracks(tracks);
//   }

//   private renderTracks(tracks: Track[]): void {
//     const trackListContainer = document.querySelector('.track-list') as HTMLElement;
//     if (!trackListContainer) {
//       console.error('Контейнер для треков не найден');
//       return;
//     }

//     trackListContainer.innerHTML = '';

  
//     tracks.forEach((track, index) => {
//       const trackElement = document.createElement('div');
//       trackElement.classList.add('track-item');
//       trackElement.innerHTML = `
//         <li class="tracks__item flex">
//           <div class="tracks__item__number">${index + 1}</div>
//           <div class="tracks__item__name">
//             <img class="track__img" src="${track.image}" alt="${track.name}">
//             <div class="track__content">
//               <h3 class="track__name"><a class="track__name__link" href="#">${track.name}</a></h3>
//               <span class="track__author">${track.artist}</span>
//             </div>
//           </div>
//           <div class="tracks__item__albom">${track.album}</div>
//           <div class="tracks__item__data flex">
//             <span class="data__text">${track.createAd}</span>
//             <button class="track__like-btn">
//               <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z" fill="#FC6D3E"/>
//               </svg>
//             </button>
//           </div>
//           <time class="tracks__item__time">${track.duration}</time>
//           <div class="tracks__item__drop">
//             <button class="track__btn-dropdown">
//               <svg width="23" height="4" viewBox="0 0 23 4" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <circle cx="2" cy="2" r="2" fill="#C4C4C4"/>
//                 <circle cx="11.5" cy="2" r="2" fill="#C4C4C4"/>
//                 <circle cx="21" cy="2" r="2" fill="#C4C4C4"/>
//               </svg>
//             </button>
//             <div class="track__dropdown">
//               <!-- <button class="track__add-btn">Добавить в плейлист</button> -->
//               <button class="track__delete-btn">Удалить из плейлиста</button> 
//             </div>
//           </div>
//         </li>
//       `;
//       trackListContainer.appendChild(trackElement);

//       this.addTrackEventListeners(trackElement, track);
//     });
//   }

//   private addTrackEventListeners(trackElement: HTMLElement, track: Track): void {
//     const likeButton = trackElement.querySelector('.track__like-btn') as HTMLElement;
//     if (likeButton) {
//       likeButton.addEventListener('click', () => {
//         this.handleLikeButtonClick(track, likeButton);
//       });
//     }

//     const dropdownButton = trackElement.querySelector('.track__btn-dropdown') as HTMLElement;
//     if (dropdownButton) {
//       dropdownButton.addEventListener('click', (event) => {
//         event.stopPropagation(); 
//         this.toggleDropdown(trackElement);
//       });
//     }

//     const deleteButton = trackElement.querySelector('.track__delete-btn') as HTMLElement;
//     if (deleteButton) {
//       deleteButton.addEventListener('click', (event) => {
//         event.stopPropagation(); 
//         this.handleDeleteButtonClick(track);
//       });
//     }

//     const addButton = trackElement.querySelector('.track__add-btn') as HTMLElement;
//     if (addButton) {
//       addButton.addEventListener('click', () => {
//         this.selectedTrack = track; 
//         this.openSidebarModal();
//       });
//     }
//   }

//   private openSidebarModal(): void {
//     const modalElement = document.querySelector('.playlists-modal') as HTMLElement;
//     const playlistContentElement = document.getElementById('playlistContent') as HTMLElement;

//     if (playlistContentElement && modalElement) {
//       if (this.selectedTrack) {
//         const sidebar = new Sidebar(this.selectedTrack); 
//         playlistContentElement.innerHTML = sidebar.getTemplate();
//         modalElement.classList.add('show');

//         const closeButton = modalElement.querySelector('.playlists-modal__close-btn') as HTMLElement;
//         if (closeButton) {
//           closeButton.addEventListener('click', () => {
//             modalElement.classList.remove('show');
//           });
//         }

//         document.addEventListener('click', this.handleOutsideClick, true);
//       } else {
//         console.error('Выбранный трек не установлен.');
//       }
//     } else {
//       console.error('Modal or playlist content element not found.');
//     }
//   }

//   private handleOutsideClick = (event: MouseEvent): void => {
//     const modalElement = document.querySelector('.playlists-modal') as HTMLElement;

//     if (modalElement && !modalElement.contains(event.target as Node)) {
//       modalElement.classList.remove('show');
//       document.removeEventListener('click', this.handleOutsideClick, true);
//     }
//   }

//   private handleLikeButtonClick(track: Track, likeButton: HTMLElement): void {
  
//     //track.isFavorite = !track.isFavorite;
  
//     //likeButton.classList.toggle('like-btn--active', track.isFavorite);
   
//     this.renderTracks(this.getTracksForCurrentPlaylist());
//   }

//   private toggleDropdown(trackElement: HTMLElement): void {
//     const dropdowns = document.querySelectorAll('.track__dropdown');
//     dropdowns.forEach(dropdown => {
//       if (dropdown.parentElement !== trackElement && dropdown.classList.contains('dropdown--active')) {
//         dropdown.classList.remove('dropdown--active');
//       }
//     });

//     const dropdown = trackElement.querySelector('.track__dropdown') as HTMLElement;
//     if (dropdown) {
//       dropdown.classList.toggle('dropdown--active');
//     }
//   }

//   private handleDeleteButtonClick(track: Track): void {
//     const currentPlaylistId = this.getCurrentPlaylistId();
//     const playlist = this.playlists.find(playlist => playlist.id === currentPlaylistId);

//     if (playlist) {
//       playlist.tracks = playlist.tracks.filter(t => t.id !== track.id);
//       this.renderTracks(this.getTracksForCurrentPlaylist());
//     } else {
//       console.error('Плейлист не найден');
//     }
//   }

//   private initializeEventListeners(): void {
//     document.addEventListener('playlist-select', (event: Event) => {
//       if (event instanceof CustomEvent) {
//         const playlistId = event.detail;
//         this.handlePlaylistSelect(playlistId);
//       }
//     });

 
//     document.addEventListener('click', (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('.track__dropdown') && !target.closest('.track__btn-dropdown')) {
//         document.querySelectorAll('.track__dropdown.dropdown--active').forEach(dropdown => {
//           dropdown.classList.remove('dropdown--active');
//         });
//       }
//     });
//   }
// }
// /*
// import { Tracks } from './model/tracks';
// import { Track } from "./components/track-list/trackList";
// import { UserAction } from './model/userActions';
// import { TrackListPresenter } from './presenters/TrackListPresenter';
// import { PlaylistPage } from './components/playlist-page/playlistPage';
// import { Playlist } from './model/playlist';
// import { mockTracks } from './data/tracks';


// export class Presenter {


//   //private trackListPresenter: TrackListPresenter;
//   private playlists: Playlist[] = [
//     {
//       id: '1',
//       name: 'Плейлист #1',
//       imageUrl: 'img/playlist1.jpg',
//       trackCount: 3,
//       tracks: [
//         {
//           id: '1',
//           imgSrc: 'img/tracks%20(1).jpg',
//           trackName: 'In Bloom',
//           artist: 'Nirvana',
//           album: 'Nirvana',
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '2',
//           imgSrc: 'img/tracks%20(2).jpg',
//           trackName: "Gangsta's Paradise",
//           artist: 'Coolio, L.V.',
//           album: "Gangsta's Paradise",
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '3',
//           imgSrc: 'img/tracks%20(3).jpg',
//           trackName: 'Histoire Sans Nom',
//           artist: 'Ludovico Einaudi, Czech National Symphony Orchestra',
//           album: 'Cinema',
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//       ],
//     },
//     {
//       id: '2',
//       name: 'Плейлист #2',
//       imageUrl: 'img/playlist2.jpg',
//       trackCount: 3,
//       tracks: [
//         {
//           id: '4',
//           imgSrc: 'img/tracks%20(4).jpg',
//           trackName: "Animal I Have Become",
//           artist: 'Three Days Grace',
//           album: "One-X",
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '5',
//           imgSrc: 'img/tracks%20(5).jpg',
//           trackName: 'When the Lights Come On',
//           artist: 'IDLES',
//           album: 'CRAWLER',
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '6',
//           imgSrc: 'img/tracks%20(6).jpg',
//           trackName: "To The Skies From A Hillside",
//           artist: 'Maybeshewill',
//           album: "To The Skies From A Hillside",
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//       ],
//     },
//     {
//       id: '3',
//       name: 'Плейлист #3',
//       imageUrl: 'img/playlist3.jpg',
//       trackCount: 3,
//       tracks: [
//         {
//           id: '7',
//           imgSrc: 'img/tracks%20(7).jpg',
//           trackName: 'Co-Conspirators',
//           artist: 'Maybeshewill',
//           album: 'Sing The Word Hope In Four​-​Part Harmony',
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '8',
//           imgSrc: 'img/tracks%20(8).jpg',
//           trackName: "Surrounded By Spies",
//           artist: 'Placebo',
//           album: "Surrounded By Spies",
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//         {
//           id: '9',
//           imgSrc: 'img/tracks%20(2).jpg',
//           trackName: 'Histoire Sans Nom',
//           artist: 'Ludovico Einaudi, Czech National Symphony Orchestra',
//           album: 'Cinema',
//           timeAgo: '6 дней назад',
//           duration: '5:35',
//           isFavorite: false,
//         },
//       ],
//     },
//   ];

//   constructor(private tracksModel: Tracks) {
//     this.initializeEventListeners();
//   }

//   public init(): void {
//     // Инициализация треков
//     const tracks = this.tracksModel.getTracks();
//     this.renderTracks(tracks);

//     // Инициализация страницы плейлистов
//     // const playlistPage = new PlaylistPage();
//     // document.body.appendChild(playlistPage.getElement()); // Добавляем страницу плейлистов в body
//   }

//   public handleUserAction(action: UserAction, track: Track): void {
//     switch (action) {
//       case UserAction.ADD_TRACK:
//         this.tracksModel.addTrack(track);
//         break;
//       case UserAction.DELETE_TRACK:
//         this.tracksModel.deleteTrack(track.id);
//         break;
//       case UserAction.UPDATE_TRACK:
//         this.tracksModel.updateTrack(track);
//         break;
//       default:
//         console.error('Неизвестное действие:', action);
//     }
//     this.renderTracks(this.tracksModel.getTracks());
//   }

//   private renderTracks(tracks: Track[]): void {
//     const trackListContainer = document.querySelector('.track-list') as HTMLElement;
//     if (!trackListContainer) {
//       console.error('Контейнер для треков не найден');
//       return;
//     }

//     // Очистка текущего списка треков
//     trackListContainer.innerHTML = '';

//     // Генерация и добавление треков
//     tracks.forEach(track => {
//       const trackElement = document.createElement('div');
//       trackElement.classList.add('track-item');
//       trackElement.innerHTML = `
//         <li class="tracks__item flex">
//         <div class="tracks__item__number">${track.id}</div>
//         <div class="tracks__item__name">
//           <img class="track__img" src="${track.imgSrc}" alt="${track.trackName}">
//           <div class="track__content">
//             <h3 class="track__name"><a class="track__name__link" href="#">${track.trackName}</a></h3>
//             <span class="track__author">${track.artist}</span>
//           </div>
//         </div>
//         <div class="tracks__item__albom">${track.album}</div>
//         <div class="tracks__item__data flex">
//           <span class="data__text">${track.timeAgo}</span>
//           <button class="track__like-btn ${track.isFavorite ? 'like-btn--active' : ''}">
//             <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <path d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z" fill="#FC6D3E"/>
//             </svg>
//           </button>
//         </div>
//         <time class="tracks__item__time">${track.duration}</time>
//         <div class="tracks__item__drop">
//           <button class="track__btn-dropdown">
//             <svg width="23" height="4" viewBox="0 0 23 4" fill="none" xmlns="http://www.w3.org/2000/svg">
//               <circle cx="2" cy="2" r="2" fill="#C4C4C4"/>
//               <circle cx="11.5" cy="2" r="2" fill="#C4C4C4"/>
//               <circle cx="21" cy="2" r="2" fill="#C4C4C4"/>
//             </svg>
//           </button>
//           <div class="track__dropdown">
//             <button class="track__add-btn">Добавить в плейлист</button>
//             <button class="track__delete-btn">Удалить из плейлиста</button>
//           </div>
//         </div>
//       </li>
//       `;
//       trackListContainer.appendChild(trackElement);
//     });
//   }

//   private initializeEventListeners(): void {
//     // Обработчик события для кнопки "Треки"
//     // document.getElementById('tracksButton')?.addEventListener('click', () => {
//     //   // Получаем все треки из mockTracks
//     //   const tracksAll = mockTracks;
//     //   this.tracksModel.setTracks(tracksAll); // Устанавливаем треки в модель
//     //   this.renderTracks(tracksAll); // Рендерим треки
//     // });

//     // Приведение типа события к CustomEvent
//     document.addEventListener('playlist-select', (event: Event) => {
//       if (event instanceof CustomEvent) {
//         const playlistId = event.detail;
//         this.handlePlaylistSelect(playlistId);
//       }
//     });
//   }

//   private handlePlaylistSelect(playlistId: string): void {
//     const selectedPlaylist = this.playlists.find(playlist => playlist.id === playlistId);
//     if (selectedPlaylist) {
//       this.tracksModel.setTracks(selectedPlaylist.tracks); // Устанавливаем треки выбранного плейлиста
//       this.renderTracks(selectedPlaylist.tracks); // Перерисовываем треки
//     }
//   }
// }
//   */


// /*
// import { Tracks, Track } from './model/tracks';
// import { Playlists, Playlist } from './model/playlist';
// import { UserAction } from './model/user-actions';

// export class Presenter {
//   constructor(private tracksModel: Tracks, private playlistsModel: Playlists) {}

//   public init(): void {
//     const tracks = this.tracksModel.getTracks();
//     const playlists = this.playlistsModel.getPlaylists();
//     this.renderTracks(tracks);
//     this.renderPlaylists(playlists);
//   }

//   public handleUserAction(action: UserAction, track: Track, playlistId?: string): void {
//     switch (action) {
//       case UserAction.ADD_TRACK:
//         if (playlistId) {
//           this.playlistsModel.addTrackToPlaylist(playlistId, track);
//         }
//         break;
//       case UserAction.DELETE_TRACK:
//         if (playlistId) {
//           this.playlistsModel.removeTrackFromPlaylist(playlistId, track.id);
//         }
//         break;
//       case UserAction.UPDATE_TRACK:
//         this.tracksModel.updateTrack(track);
//         break;
//       default:
//         console.error('Неизвестное действие:', action);
//     }
//     this.renderTracks(this.tracksModel.getTracks());
//     this.renderPlaylists(this.playlistsModel.getPlaylists());
//   }

//   private renderTracks(tracks: Track[]): void {
//     // Логика отображения треков
//     const tracksContainer = document.getElementById('tracksContainer');
//     if (!tracksContainer) return;

//     tracksContainer.innerHTML = ''; // Очищаем контейнер перед отрисовкой

//     tracks.forEach((track, index) => {
//         const trackElement = document.createElement('div');
//         trackElement.className = 'track-item';
//         trackElement.innerHTML = `
//             <div class="track-item__number">${index + 1}</div>
//             <div class="track-item__title">${track.trackName}</div>
//             <div class="track-item__artist">${track.artist}</div>
//             <button class="track-item__add-btn">Добавить</button>
//             <button class="track-item__delete-btn">Удалить</button>
//         `;

//         // Установка обработчиков событий для добавления и удаления трека
//         const addButton = trackElement.querySelector('.track-item__add-btn');
//         addButton?.addEventListener('click', () => {
//             const playlistId = prompt("Введите ID плейлиста для добавления трека:");
//             if (playlistId) {
//                 this.handleUserAction(UserAction.ADD_TRACK, track, playlistId);
//             }
//         });

//         const deleteButton = trackElement.querySelector('.track-item__delete-btn');
//         deleteButton?.addEventListener('click', () => {
//             const playlistId = prompt("Введите ID плейлиста для удаления трека:");
//             if (playlistId) {
//                 this.handleUserAction(UserAction.DELETE_TRACK, track, playlistId);
//             }
//         });

//         tracksContainer.appendChild(trackElement);
//     });
//   }

//   private renderPlaylists(playlists: Playlist[]): void {
//     // Логика отображения плейлистов
//     const playlistsContainer = document.querySelector('.sidebar-container');
//     if (!playlistsContainer) return;

//     playlistsContainer.innerHTML = ''; // Очищаем контейнер перед отрисовкой

//     playlists.forEach(playlist => {
//         const playlistElement = document.createElement('div');
//         playlistElement.className = 'playlist-item';
//         playlistElement.setAttribute('data-id', playlist.id);
//         playlistElement.innerHTML = `
//             <div class="playlist-item__title">${playlist.name}</div>
//             <div class="playlist-item__count">${playlist.tracks.length} треков</div>
//         `;

//         playlistElement.addEventListener('click', () => {
//             alert(`Выбран плейлист: ${playlist.name}`);
//             // Здесь можно добавить логику для отображения треков внутри выбранного плейлиста
//         });

//         playlistsContainer.appendChild(playlistElement);
//     });
//   }
// }
// */




