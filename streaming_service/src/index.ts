import { Sidebar } from './components/sidebar/sidebar';
import { UserProfile } from './components/user-profile/userProfile';
import { PlaylistPage } from './components/playlist-page/playlistPage';
import { TrackList } from './components/track-list/trackList';
import { TrackItem } from './components/track-list/trackList';
import { Playlists } from './components/playlists/playlists';
import { render, RenderPosition } from './core/render';
import { TrackListPresenter } from './presenters/TrackListPresenter';
//import { mockTracks } from './data/tracks';
import { initPlaylists } from './data/playlistData'
import { Tracks } from './model/tracks';
import { TracksApi } from './model/tracksApiModal';
//import { Presenter } from './presenter';
import { UserAction } from './model/userActions';
import { PlaylistApiModel } from './model/playlistApiModel';
import { Track } from './components/track-list/trackList';
import { fetchUserPlaylists, fetchTracks, likeTrack, fetchPlaylist } from './apiService';
//import { SearchPresenter } from './presenters/SearchPresenter';

export enum ScreenState {
  PlaylistList = 'PlaylistList',
  Tracks = 'Tracks',
  Playlist = 'Playlist',
  FavoriteTracks = 'FavoriteTracks'
}

async function initTracks() {
  try {
    const tracks = await fetchTracks();
    tracksModel.setTracks(tracks);
    console.log('Tracks loaded:', tracksModel.getTracks());
  } catch (error) {
    console.error('Error loading tracks:', error);
  }
}

const tracksModel = new Tracks(); 
let playlists: PlaylistApiModel[] = []; 
let trackListPresenter: TrackListPresenter | null = null; 
let audioPlayer: AudioPlayer;

// Блок для плеера

class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private tracks: Track[] = [];
  private currentTrackIndex: number = 0;
  private trackImageElement: HTMLImageElement | null = null;
  private trackNameElement: HTMLElement | null = null;
  private trackAuthorElement: HTMLElement | null = null;
  private timeStartElement: HTMLElement | null = null;
  private timeEndElement: HTMLElement | null = null;
  private playButton: HTMLButtonElement | null = null;
  private pauseButton: HTMLButtonElement | null = null; // новая кнопка для паузы
  private progressRange: HTMLDivElement | null = null;
  private volumeRange: HTMLDivElement | null = null;
  private currentTrack: Track | null = null;
  private isPlaying: boolean;

  constructor(tracks: Track[]) {
    this.audioElement = new Audio();
    this.tracks = tracks; // Передаем треки в плеер
    this.setupPlayerUI();
    this.initializeAudioContext();
    this.isPlaying = false;
    this.addDynamicStyles();

    // Инициализация кнопок play/pause
    if (this.playButton) {
      this.playButton.addEventListener('click', () => this.playCurrentTrack());
    }

    if (this.pauseButton) {
      this.pauseButton.addEventListener('click', () => this.pauseCurrentTrack());
    }
  }

  // Инициализация AudioContext
  private initializeAudioContext(): void {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  private addDynamicStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      .highlight .track__name__link {
        color: var(--color-promo);
      }
      .highlight .track__name__link::before {
        border-color: var(--color-promo);
      }
    `;
    document.head.appendChild(style);
  }

  

private timeInterval: any; // Переменная для хранения интервала
private isTrackEnded: boolean = false;
private currentTime: number = 0;
private startTime: number = 0; // Устанавливаем значение по умолчанию
private isRepeat: boolean = false;
private isShuffle: boolean = false;
private currentTrackId: number | null = null;

private stopTimeUpdate() {
    if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.timeInterval = undefined;
    }
}

private async playCurrentTrack() {
  if (this.tracks.length === 0) return;

  this.removeHighlightFromCurrentTrack();

  const currentTrack = this.tracks[this.currentTrackIndex];
  this.currentTrack = currentTrack;
  this.currentTrackId = currentTrack.id;

  // Если трек уже играет, не начинаем воспроизведение снова
  if (this.isPlaying && !this.isRepeat) {
      console.log("Track is already playing");
      return;
  }

  // Остановить предыдущий таймер, если есть
  this.stopTimeUpdate();

  // Загрузка трека с API
  try {
      const response = await fetch(`http://localhost:3000${currentTrack.path}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

      // Если уже есть источник, остановить его (на случай повтора трека)
      if (this.sourceNode) {
          this.sourceNode.stop();
      }

      // Создание нового источника и подключение к gainNode
      this.sourceNode = this.audioContext!.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.connect(this.gainNode!);

      // Сброс текущего времени и времени начала
      this.currentTime = 0;
      this.startTime = this.audioContext!.currentTime;

      // Настроим источник на воспроизведение с начала трека
      this.sourceNode.start(0);

      // Устанавливаем флаг, что трек воспроизводится
      this.isPlaying = true;
      this.isTrackEnded = false; // Сбрасываем флаг окончания трека

      // Обновляем кнопки
      this.updatePlayButtonIcon(this.isPlaying);

      // Обновляем длительность трека
      this.timeEndElement!.textContent = this.formatTime(audioBuffer.duration);

      // Обновляем заголовок трека
      this.updateTrackTitle(currentTrack);

      // Обновляем время интерфейса каждую секунду
      this.timeInterval = setInterval(() => {
          if (this.isPlaying) { // Обновляем только если трек действительно воспроизводится
              const elapsedTime = this.audioContext!.currentTime - this.startTime;
              this.updateTimeDisplay(elapsedTime, audioBuffer.duration);
          }
      }, 1000);

      // Добавляем обработчик окончания трека
      this.sourceNode.onended = () => {
          this.isTrackEnded = true; // Устанавливаем флаг окончания трека
          if (this.isRepeat) {
              this.currentTime = 0; // Сбрасываем текущее время
              this.playCurrentTrack(); // Если включён режим повтора, воспроизводим трек снова
          } else if (this.isPlaying) {
              this.handleNextButtonClick(); // Иначе переходим к следующему треку
          }
      };

      // Обновляем выделение текущего трека
      this.highlightCurrentTrack();

      console.log("Track is playing");
  } catch (error) {
      console.error('Error loading or decoding audio data', error);
  }
}

private highlightCurrentTrack() {
  
  // Устанавливаем новое выделение для текущего трека
  this.currentTrackId = this.tracks[this.currentTrackIndex].id;
  const currentTrackElement = document.getElementById(`trackId-${this.currentTrackId}`);
  if (currentTrackElement) {
    currentTrackElement.classList.add('highlight');
  }
}

private pauseCurrentTrack(): void {
    if (this.isPlaying && this.sourceNode) {
        this.sourceNode.stop(); // Останавливаем источник

        // Сохраняем текущее время трека
        if (this.audioContext) {
            this.currentTime = this.audioContext.currentTime - this.startTime;
        }

        this.isPlaying = false;
        this.isTrackEnded = false; // Сбрасываем флаг окончания трека

        // Останавливаем таймер обновления времени
        this.stopTimeUpdate();

        // Обновляем кнопки
        this.updatePlayButtonIcon(this.isPlaying);

        console.log("Track is paused");
    }
}

  private setupPlayerUI() {
    const footer = document.getElementById('footer');
    if (!footer) return;

    const playerContainer = document.createElement('div');
    playerContainer.className = 'player flex';

    // Элемент для отображения информации о треке
    const trackNameContainer = document.createElement('div');
    trackNameContainer.className = 'player__track-name flex';

    this.trackImageElement = document.createElement('img');
    this.trackImageElement.className = 'player__track__img';

    const trackNameContent = document.createElement('div');
    trackNameContent.className = 'player__track-name__content';

    this.trackNameElement = document.createElement('h3');
    this.trackNameElement.className = 'player__track__h3';
    this.trackNameElement.textContent = 'Нет треков';

    this.trackAuthorElement = document.createElement('p');
    this.trackAuthorElement.className = 'player__track__author';
    this.trackAuthorElement.textContent = '';

    const trackHeader = document.createElement('div');
    trackHeader.className = 'flex player__name__header';

    const likeButton = document.createElement('button');
    likeButton.className = 'player__track__like';
    likeButton.innerHTML = `<svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5022 8.2786e-06C14.6291 -0.00149138 13.7677 0.200775 12.9865 0.590718C12.2052 0.980661 11.5258 1.54752 11.0022 2.24621C10.293 1.30266 9.30512 0.606001 8.17823 0.254823C7.05134 -0.0963541 5.84256 -0.0842713 4.72291 0.289363C3.60327 0.662997 2.62948 1.37926 1.93932 2.3368C1.24916 3.29434 0.877596 4.44467 0.877197 5.62501C0.877197 12.3621 10.2373 17.6813 10.6357 17.9044C10.7477 17.9671 10.8739 18 11.0022 18C11.1305 18 11.2567 17.9671 11.3687 17.9044C13.0902 16.8961 14.7059 15.7173 16.1914 14.3856C19.4665 11.438 21.1272 8.49047 21.1272 5.62501C21.1255 4.13368 20.5323 2.70393 19.4778 1.6494C18.4233 0.594873 16.9935 0.00169855 15.5022 8.2786e-06V8.2786e-06Z" fill="#FC6D3E"/>
      </svg>`;

    trackHeader.appendChild(this.trackNameElement);
    //trackHeader.appendChild(likeButton);
    trackNameContent.appendChild(trackHeader);
    trackNameContent.appendChild(this.trackAuthorElement);
    trackNameContainer.appendChild(this.trackImageElement);
    trackNameContainer.appendChild(trackNameContent);

    // Элементы управления плеером
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'player__controls';

    const controlsHeader = document.createElement('div');
    controlsHeader.className = 'player__controls__header';

    const shuffleButton = document.createElement('button');
    shuffleButton.className = 'player__shaffle-btn';
    shuffleButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path class="shuffle-icon" d="M14.9946 11.4307C14.9933 11.4211 14.9922 11.4116 14.9903 11.4021C14.9887 11.3943 14.9866 11.3867 14.9846 11.379C14.9826 11.3709 14.9808 11.3627 14.9784 11.3546C14.9761 11.3471 14.9732 11.3398 14.9706 11.3324C14.9678 11.3244 14.9651 11.3163 14.9618 11.3084C14.959 11.3017 14.9557 11.2952 14.9526 11.2886C14.9488 11.2804 14.9451 11.2721 14.9408 11.264C14.9375 11.258 14.9338 11.2522 14.9303 11.2463C14.9255 11.2382 14.9209 11.23 14.9156 11.2221C14.9114 11.2159 14.9068 11.2101 14.9024 11.2041C14.8972 11.197 14.8921 11.1897 14.8864 11.1828C14.8792 11.174 14.8713 11.1657 14.8635 11.1574C14.8601 11.1538 14.8571 11.1499 14.8536 11.1464L13.3536 9.64642C13.3071 9.59999 13.252 9.56316 13.1914 9.53803C13.1307 9.5129 13.0657 9.49997 13 9.49997C12.9343 9.49997 12.8693 9.5129 12.8086 9.53803C12.748 9.56316 12.6929 9.59999 12.6464 9.64642C12.6 9.69285 12.5632 9.74798 12.538 9.80865C12.5129 9.86931 12.5 9.93433 12.5 10C12.5 10.0657 12.5129 10.1307 12.538 10.1914C12.5632 10.252 12.6 10.3071 12.6464 10.3536L13.2929 11H12.5585C12.0015 10.9994 11.4526 10.8662 10.9573 10.6113C10.462 10.3565 10.0346 9.98729 9.71039 9.53436L7.10333 5.88446C6.68649 5.30212 6.13693 4.82744 5.50015 4.49974C4.86337 4.17203 4.15769 4.00072 3.44153 4H2C1.86739 4 1.74021 4.05268 1.64645 4.14645C1.55268 4.24021 1.5 4.36739 1.5 4.5C1.5 4.63261 1.55268 4.75979 1.64645 4.85355C1.74021 4.94732 1.86739 5 2 5H3.44153C3.99854 5.00056 4.5474 5.13379 5.04268 5.38866C5.53795 5.64353 5.96539 6.01271 6.28961 6.46564L8.89667 10.1155C9.31351 10.6979 9.86307 11.1726 10.4999 11.5003C11.1366 11.828 11.8423 11.9993 12.5585 12H13.2929L12.6464 12.6464C12.5526 12.7402 12.5 12.8674 12.5 13C12.5 13.1326 12.5526 13.2598 12.6464 13.3536C12.7402 13.4474 12.8674 13.5 13 13.5C13.1326 13.5 13.2598 13.4474 13.3536 13.3536L14.8536 11.8536C14.8571 11.8501 14.8601 11.8462 14.8635 11.8426C14.8713 11.8343 14.8792 11.826 14.8864 11.8172C14.8921 11.8103 14.8972 11.803 14.9024 11.7959C14.9068 11.7899 14.9114 11.7841 14.9156 11.7779C14.9209 11.77 14.9255 11.7618 14.9303 11.7537C14.9338 11.7478 14.9375 11.742 14.9408 11.736C14.9451 11.7279 14.9488 11.7196 14.9526 11.7114C14.9557 11.7048 14.959 11.6983 14.9618 11.6916C14.9651 11.6837 14.9678 11.6756 14.9706 11.6676C14.9732 11.6602 14.9761 11.6529 14.9784 11.6454C14.9808 11.6373 14.9826 11.6291 14.9846 11.621C14.9866 11.6133 14.9887 11.6057 14.9903 11.5979C14.9922 11.5884 14.9933 11.5789 14.9946 11.5693C14.9955 11.5627 14.9968 11.5562 14.9975 11.5495C15.0008 11.5166 15.0008 11.4834 14.9975 11.4505C14.9968 11.4438 14.9955 11.4373 14.9946 11.4307Z" fill="#AAAAAA"/>
                <path class="shuffle-icon" d="M8.93836 6.68632C8.99178 6.7245 9.0522 6.75179 9.11617 6.76661C9.18014 6.78144 9.24641 6.78351 9.31118 6.77271C9.37595 6.76191 9.43796 6.73846 9.49366 6.70368C9.54936 6.66891 9.59766 6.6235 9.63581 6.57004L9.71039 6.46561C10.0346 6.01269 10.4621 5.64351 10.9573 5.38863C11.4526 5.13376 12.0015 5.00053 12.5585 4.99997H13.2929L12.6464 5.6464C12.5527 5.74017 12.5 5.86736 12.5 5.99997C12.5 6.13259 12.5527 6.25978 12.6464 6.35355C12.7402 6.44733 12.8674 6.50001 13 6.50001C13.1326 6.50001 13.2598 6.44733 13.3536 6.35355L14.8536 4.85355C14.8571 4.85003 14.8601 4.84618 14.8635 4.84258C14.8713 4.83428 14.8792 4.82599 14.8864 4.81717C14.8922 4.81025 14.8972 4.80298 14.9024 4.79583C14.9068 4.78985 14.9114 4.78408 14.9156 4.7779C14.9209 4.76999 14.9255 4.76179 14.9303 4.75364C14.9338 4.74775 14.9375 4.74201 14.9408 4.73595C14.9451 4.72788 14.9488 4.71957 14.9526 4.71134C14.9557 4.70475 14.959 4.69829 14.9618 4.69155C14.9651 4.68364 14.9678 4.67557 14.9706 4.66753C14.9732 4.66014 14.9761 4.65287 14.9784 4.64533C14.9808 4.63727 14.9826 4.62909 14.9847 4.62094C14.9866 4.61325 14.9887 4.60569 14.9903 4.59786C14.9922 4.5884 14.9933 4.57883 14.9946 4.56929C14.9955 4.56267 14.9968 4.55617 14.9975 4.54947C15.0008 4.51655 15.0008 4.48339 14.9975 4.45047C14.9968 4.44377 14.9955 4.43727 14.9946 4.43065C14.9933 4.42112 14.9922 4.41155 14.9903 4.40209C14.9887 4.39426 14.9866 4.38669 14.9847 4.379C14.9826 4.37085 14.9808 4.36268 14.9784 4.35462C14.9761 4.34708 14.9732 4.3398 14.9706 4.33242C14.9678 4.32438 14.9651 4.3163 14.9618 4.3084C14.959 4.30166 14.9557 4.2952 14.9526 4.28861C14.9488 4.28037 14.9451 4.27207 14.9408 4.264C14.9375 4.25794 14.9338 4.2522 14.9303 4.24631C14.9255 4.23816 14.9209 4.22995 14.9156 4.22205C14.9114 4.21587 14.9068 4.2101 14.9024 4.20412C14.8972 4.19696 14.8922 4.1897 14.8864 4.18277C14.8792 4.17395 14.8713 4.16567 14.8635 4.15737C14.8601 4.15377 14.8571 4.14992 14.8536 4.1464L13.3536 2.6464C13.2598 2.55262 13.1326 2.49994 13 2.49994C12.8674 2.49994 12.7402 2.55262 12.6464 2.6464C12.5527 2.74017 12.5 2.86736 12.5 2.99997C12.5 3.13259 12.5527 3.25977 12.6464 3.35355L13.2929 3.99997H12.5585C11.8423 4.0007 11.1366 4.17201 10.4999 4.49971C9.86307 4.82741 9.31351 5.30209 8.89667 5.88444L8.82209 5.98887C8.78392 6.04229 8.75665 6.10272 8.74183 6.16668C8.72702 6.23065 8.72495 6.29691 8.73575 6.36168C8.74655 6.42644 8.77 6.48845 8.80476 6.54415C8.83952 6.59985 8.88492 6.64816 8.93836 6.68632Z" fill="#AAAAAA"/>
                <path class="shuffle-icon" d="M7.06165 9.31365C7.00822 9.27547 6.9478 9.24818 6.88383 9.23336C6.81986 9.21854 6.7536 9.21646 6.68883 9.22726C6.62405 9.23806 6.56205 9.26152 6.50634 9.29629C6.45064 9.33107 6.40234 9.37648 6.3642 9.42993L6.28961 9.53436C5.96539 9.98728 5.53795 10.3565 5.04268 10.6113C4.5474 10.8662 3.99854 10.9994 3.44153 11H2C1.86739 11 1.74021 11.0527 1.64645 11.1464C1.55268 11.2402 1.5 11.3674 1.5 11.5C1.5 11.6326 1.55268 11.7598 1.64645 11.8535C1.74021 11.9473 1.86739 12 2 12H3.44153C4.15769 11.9993 4.86337 11.828 5.50015 11.5003C6.13693 11.1726 6.68649 10.6979 7.10333 10.1155L7.17792 10.0111C7.21609 9.95768 7.24336 9.89725 7.25817 9.83329C7.27298 9.76932 7.27505 9.70306 7.26425 9.63829C7.25346 9.57353 7.23001 9.51152 7.19524 9.45582C7.16048 9.40012 7.11508 9.35181 7.06165 9.31365Z" fill="#AAAAAA"/>
    </svg>`;
    let isShuffleActive = false;

    shuffleButton.addEventListener('click', () => {
      isShuffleActive = !isShuffleActive;
      const color = isShuffleActive ? '#FC6D3E' : '#AAAAAA';
      const shuffleIconPaths = shuffleButton.querySelectorAll('.shuffle-icon');
      shuffleIconPaths.forEach(path => path.setAttribute('fill', color));
    
      // Обновляем флаг в плеере
      this.isShuffle = isShuffleActive;
    });          

    const skipBackButton = document.createElement('button');
    skipBackButton.className = 'player__skipback-btn';
    skipBackButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 2C3.63261 2 3.75978 2.05268 3.85355 2.14645C3.94732 2.24022 4 2.36739 4 2.5V7.10846L11.4786 2.53821C11.6302 2.44558 11.8037 2.39501 11.9813 2.39169C12.1589 2.38838 12.3342 2.43244 12.4892 2.51934C12.6441 2.60624 12.7731 2.73285 12.8629 2.88615C12.9527 3.03944 13 3.21389 13 3.39154V12.6085C12.9999 12.7861 12.9526 12.9605 12.8628 13.1137C12.773 13.267 12.644 13.3936 12.489 13.4805C12.3341 13.5674 12.1588 13.6114 11.9812 13.6081C11.8036 13.6048 11.6301 13.5543 11.4785 13.4618L4 8.89151V13.5C4 13.6326 3.94732 13.7598 3.85355 13.8536C3.75979 13.9473 3.63261 14 3.5 14C3.36739 14 3.24021 13.9473 3.14645 13.8536C3.05268 13.7598 3 13.6326 3 13.5V2.5C3 2.36739 3.05268 2.24022 3.14645 2.14645C3.24022 2.05268 3.36739 2 3.5 2Z" fill="#AAAAAA"/>
           </svg>`;

    this.playButton = document.createElement('button');
    this.playButton.className = 'player__play-btn';
    this.playButton.id = 'playButton';
    this.playButton.innerHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z" fill="#AAAAAA"/>
                  <path d="M27.0385 21.4138C26.9679 21.4862 26.7012 21.7962 26.4528 22.0512C24.9963 23.655 21.197 26.28 19.2085 27.0813C18.9065 27.21 18.143 27.4825 17.735 27.5C17.3441 27.5 16.9715 27.41 16.6159 27.2275C16.1727 26.9725 15.8171 26.5713 15.6223 26.0975C15.4968 25.7688 15.302 24.785 15.302 24.7675C15.1072 23.6913 15 21.9425 15 20.01C15 18.1688 15.1072 16.4913 15.2667 15.3988C15.2849 15.3812 15.4798 14.1588 15.6929 13.74C16.0838 12.975 16.8473 12.5 17.6644 12.5H17.735C18.2672 12.5187 19.3863 12.9938 19.3863 13.0113C21.2677 13.8138 24.9793 16.31 26.471 17.9688C26.471 17.9688 26.8911 18.395 27.0738 18.6613C27.3587 19.0437 27.5 19.5175 27.5 19.9913C27.5 20.52 27.3405 21.0125 27.0385 21.4138Z" fill="white"/>
              </svg>`;

    this.pauseButton = document.createElement('button');
    this.pauseButton.className = 'player__pause-btn';
    this.pauseButton.id = 'pauseButton';
    this.pauseButton.innerHTML = `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM8.58579 8.58579C8 9.17157 8 10.1144 8 12C8 13.8856 8 14.8284 8.58579 15.4142C9.17157 16 10.1144 16 12 16C13.8856 16 14.8284 16 15.4142 15.4142C16 14.8284 16 13.8856 16 12C16 10.1144 16 9.17157 15.4142 8.58579C14.8284 8 13.8856 8 12 8C10.1144 8 9.17157 8 8.58579 8.58579Z" fill="#AAAAAA"/>
      </svg>
      `;
    this.pauseButton.style.display = 'none';

    const skipNextButton = document.createElement('button');
    skipNextButton.className = 'player__skipnext-btn';
    skipNextButton.innerHTML = `<svg width="10" height="12" viewBox="0 0 10 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 0.5V11.5C10 11.6326 9.94732 11.7598 9.85355 11.8536C9.75979 11.9473 9.63261 12 9.5 12C9.36739 12 9.24021 11.9473 9.14645 11.8536C9.05268 11.7598 9 11.6326 9 11.5V6.89151L1.52148 11.4618C1.36989 11.5544 1.19636 11.605 1.01873 11.6083C0.841109 11.6116 0.665804 11.5676 0.510852 11.4807C0.355901 11.3938 0.226897 11.2672 0.137111 11.1139C0.0473251 10.9606 -1.32783e-06 10.7861 0 10.6085V1.39154C-2.12292e-06 1.21389 0.0473207 1.03944 0.137101 0.886149C0.226881 0.732854 0.355877 0.606243 0.51082 0.519338C0.665764 0.432434 0.841061 0.388374 1.01868 0.39169C1.1963 0.395007 1.36983 0.44558 1.52142 0.538208L9 5.10846V0.5C9 0.367392 9.05268 0.240215 9.14645 0.146447C9.24021 0.0526785 9.36739 0 9.5 0C9.63261 0 9.75979 0.0526785 9.85355 0.146447C9.94732 0.240215 10 0.367392 10 0.5Z" fill="#AAAAAA"/>
             </svg>`;

    const repeatButton = document.createElement('button');
    repeatButton.className = 'player__repeat-btn';
    repeatButton.innerHTML = `<svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="repeat-icon" d="M1 6.50001C1.13261 6.5 1.25978 6.44732 1.35355 6.35356C1.44731 6.25979 1.49999 6.13262 1.5 6.00001C1.50105 5.07207 1.87013 4.18244 2.52628 3.52629C3.18243 2.87014 4.07206 2.50106 5 2.50001H11.7929L11.1464 3.14646C11.0527 3.24024 11 3.36742 11 3.50003C11 3.63264 11.0527 3.75982 11.1465 3.85359C11.2402 3.94735 11.3674 4.00003 11.5 4.00002C11.6326 4.00002 11.7598 3.94733 11.8536 3.85356L13.3536 2.35356C13.3553 2.35188 13.3567 2.34999 13.3583 2.34828C13.3681 2.33824 13.3777 2.32792 13.3866 2.31706C13.3918 2.31065 13.3964 2.3039 13.4013 2.29731C13.4061 2.29084 13.4112 2.28453 13.4157 2.27781C13.4208 2.27015 13.4252 2.26222 13.4299 2.25438C13.4336 2.24821 13.4374 2.24223 13.4408 2.23591C13.4451 2.22797 13.4487 2.21983 13.4525 2.21174C13.4556 2.20503 13.459 2.19844 13.4618 2.19154C13.4651 2.1837 13.4677 2.1757 13.4706 2.16774C13.4732 2.16029 13.4761 2.15297 13.4784 2.14537C13.4808 2.13734 13.4826 2.12916 13.4846 2.12104C13.4865 2.11336 13.4887 2.10572 13.4903 2.09788C13.4922 2.08845 13.4933 2.0789 13.4946 2.06935C13.4956 2.06272 13.4968 2.05622 13.4975 2.04951C13.5008 2.01659 13.5008 1.98343 13.4975 1.95051C13.4968 1.9438 13.4956 1.9373 13.4946 1.93067C13.4933 1.92112 13.4922 1.91157 13.4903 1.90214C13.4887 1.8943 13.4865 1.88667 13.4846 1.87898C13.4826 1.87086 13.4808 1.86268 13.4784 1.85466C13.4761 1.84706 13.4732 1.83973 13.4706 1.83229C13.4677 1.82432 13.4651 1.81633 13.4618 1.80848C13.459 1.80159 13.4556 1.79499 13.4525 1.78828C13.4487 1.78019 13.4451 1.77204 13.4408 1.76411C13.4374 1.75779 13.4336 1.75181 13.4299 1.74565C13.4252 1.7378 13.4208 1.72987 13.4157 1.72221C13.4112 1.71549 13.4061 1.70918 13.4013 1.70271C13.3964 1.69612 13.3918 1.68937 13.3866 1.68296C13.3775 1.67189 13.3678 1.66139 13.3578 1.65113C13.3563 1.64964 13.3551 1.64796 13.3536 1.64647L11.8536 0.146465C11.7598 0.0526909 11.6326 5.74377e-06 11.5 4.69616e-10C11.3674 -5.74283e-06 11.2402 0.0526683 11.1465 0.146435C11.0527 0.240201 11 0.367378 11 0.49999C11 0.632601 11.0527 0.759783 11.1464 0.853558L11.7929 1.50001H5C3.80694 1.50135 2.66313 1.97589 1.8195 2.81951C0.975881 3.66314 0.501344 4.80695 0.5 6.00001C0.500006 6.13262 0.552687 6.25979 0.646454 6.35356C0.740221 6.44732 0.867394 6.5 1 6.50001Z" fill="#AAAAAA"/>
        <path class="repeat-icon" d="M12.9999 5.5C12.8673 5.50001 12.7402 5.55269 12.6464 5.64645C12.5526 5.74022 12.5 5.86739 12.4999 6C12.4989 6.92794 12.1298 7.81757 11.4737 8.47372C10.8175 9.12987 9.92788 9.49895 8.99995 9.5H2.20705L2.85352 8.85355C2.94729 8.75977 2.99996 8.63259 2.99996 8.49998C2.99995 8.36737 2.94727 8.24019 2.85349 8.14642C2.75972 8.05266 2.63254 7.99998 2.49993 7.99999C2.36731 7.99999 2.24014 8.05268 2.14637 8.14645L0.64637 9.64645C0.644875 9.64795 0.643624 9.64963 0.642144 9.65112C0.632164 9.66138 0.62246 9.67187 0.613381 9.68295C0.608116 9.68936 0.603524 9.69611 0.598626 9.7027C0.593804 9.70917 0.588784 9.71548 0.584282 9.7222C0.579157 9.72986 0.574699 9.73779 0.570046 9.74564C0.566384 9.7518 0.562523 9.75778 0.559136 9.7641C0.554879 9.77203 0.551277 9.78018 0.547478 9.78827C0.544335 9.79498 0.540962 9.80157 0.538109 9.80847C0.534859 9.81632 0.532254 9.82431 0.529346 9.83228C0.526749 9.83972 0.523866 9.84705 0.521447 9.85508C0.519057 9.86268 0.517239 9.87086 0.515359 9.87897C0.513464 9.88666 0.511255 9.8943 0.50968 9.90214C0.507793 9.91157 0.506676 9.92112 0.505371 9.93066C0.50437 9.93729 0.503234 9.9438 0.502528 9.95051C0.499187 9.98342 0.499187 10.0166 0.502528 10.0495C0.503234 10.0562 0.50437 10.0627 0.505371 10.0693C0.506676 10.0789 0.507793 10.0884 0.50968 10.0979C0.511255 10.1057 0.513464 10.1133 0.515359 10.121C0.517239 10.1291 0.519057 10.1373 0.521447 10.1449C0.523866 10.1529 0.526749 10.1603 0.529346 10.1677C0.532254 10.1757 0.534859 10.1837 0.538109 10.1915C0.540962 10.1984 0.544335 10.205 0.547478 10.2117C0.551277 10.2198 0.554879 10.2279 0.559136 10.2359C0.562523 10.2422 0.566384 10.2482 0.570046 10.2544C0.574699 10.2622 0.579157 10.2701 0.584282 10.2778C0.588784 10.2845 0.593804 10.2908 0.598626 10.2973C0.603524 10.3039 0.608116 10.3106 0.613381 10.317C0.62246 10.3281 0.632164 10.3386 0.642144 10.3489C0.643624 10.3504 0.644875 10.3521 0.64637 10.3536L2.14637 11.8536C2.24014 11.9473 2.36731 12 2.49993 12C2.63254 12 2.75972 11.9473 2.85349 11.8536C2.94727 11.7598 2.99995 11.6326 2.99996 11.5C2.99996 11.3674 2.94729 11.2402 2.85352 11.1464L2.20705 10.5H8.99995C10.193 10.4987 11.3368 10.0241 12.1805 9.18048C13.0241 8.33686 13.4987 7.19305 13.4999 6C13.4999 5.86739 13.4472 5.74022 13.3534 5.64645C13.2597 5.55269 13.1325 5.50001 12.9999 5.5Z" fill="#AAAAAA"/>
    </svg>`;
    
    let isRepeatActive = false;
    
    repeatButton.addEventListener('click', () => {
        isRepeatActive = !isRepeatActive;
        const color = isRepeatActive ? '#FC6D3E' : '#AAAAAA';
        const repeatIconPaths = repeatButton.querySelectorAll('.repeat-icon');
        repeatIconPaths.forEach(path => path.setAttribute('fill', color));
    });

    controlsHeader.appendChild(shuffleButton);
    controlsHeader.appendChild(skipBackButton);
    controlsHeader.appendChild(this.playButton);
    controlsHeader.appendChild(this.pauseButton);
    controlsHeader.appendChild(skipNextButton);
    controlsHeader.appendChild(repeatButton);

    const controlsFooter = document.createElement('div');
    controlsFooter.className = 'player__controls__footer';

    this.timeStartElement = document.createElement('span');
    this.timeStartElement.className = 'player__time-start';
    this.timeStartElement.textContent = '0:00'; // Изначально 0:00

    this.progressRange = document.createElement('div');
    this.progressRange.className = 'player__range-play';
    this.progressRange.style.backgroundColor = '#e0e0e0';
    this.progressRange.style.width = '100%';
    this.progressRange.style.height = '10px';
    this.progressRange.style.position = 'relative';
    this.progressRange.style.borderRadius = '5px';
    this.progressRange.id = 'range-play';

    this.timeEndElement = document.createElement('span');
    this.timeEndElement.className = 'player__time-end';
    this.timeEndElement.textContent = '0:00'; // Изначально 0:00

    controlsFooter.appendChild(this.timeStartElement);
    controlsFooter.appendChild(this.progressRange);
    controlsFooter.appendChild(this.timeEndElement);

    controlsContainer.appendChild(controlsHeader);
    controlsContainer.appendChild(controlsFooter);

    const valueContainer = document.createElement('div');
    valueContainer.className = 'player__value';

    const volumeIcon = document.createElement('svg');
    volumeIcon.innerHTML = `<svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 9.5H1C0.867392 9.5 0.740215 9.44732 0.646447 9.35355C0.552678 9.25979 0.5 9.13261 0.5 9V5C0.5 4.86739 0.552678 4.74021 0.646447 4.64645C0.740215 4.55268 0.867392 4.5 1 4.5H4L8.5 1V13L4 9.5Z" stroke="#AAAAAA" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 4.5V9.5" stroke="#AAAAAA" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10.9124 5.58582C11.0981 5.77153 11.2454 5.99201 11.3459 6.23466C11.4464 6.47731 11.4981 6.73739 11.4981 7.00003C11.4981 7.26267 11.4464 7.52274 11.3459 7.7654C11.2454 8.00805 11.0981 8.22853 10.9124 8.41424" stroke="#AAAAAA" stroke-linecap="round" stroke-linejoin="round"/>
          
    </svg>`;

    // Шкала громкости (по умолчанию скрыта)
  this.volumeRange = document.createElement('div');
  this.volumeRange.style.width = '8px';  // Устанавливаем ширину
  this.volumeRange.style.height = '50px'; // Устанавливаем высоту
  this.volumeRange.style.backgroundColor = '#FC6D3E'; // Цвет шкалы
  this.volumeRange.style.position = 'absolute';
  this.volumeRange.style.borderRadius = '5px'
  this.volumeRange.style.right = '70px';
  this.volumeRange.style.bottom = '40px';
  this.volumeRange.style.transform = 'rotate(180deg)';
  this.volumeRange.style.transition = 'height 0.2s';
  this.volumeRange.style.display = 'none'; // Скрываем шкалу по умолчанию

  const volumeRangeBar = document.createElement('div');
  volumeRangeBar.className = 'player__volume-range-bar';
  this.volumeRange.appendChild(volumeRangeBar);

    valueContainer.appendChild(volumeIcon);
    valueContainer.appendChild(this.volumeRange);

    playerContainer.appendChild(trackNameContainer);
    playerContainer.appendChild(controlsContainer);
    playerContainer.appendChild(valueContainer);
    
    footer.appendChild(playerContainer);

    skipBackButton.addEventListener('click', this.handlePrevButtonClick.bind(this));
    skipNextButton.addEventListener('click', this.handleNextButtonClick.bind(this));

    // Обновляем время трека
    //this.audioElement.addEventListener('timeupdate', this.updateTimeDisplay.bind(this));

    // Создаем внутренний элемент прогресса, который будет изменять ширину
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.style.height = '100%';
    progressBar.style.backgroundColor = '#FC6D3E';
    progressBar.style.borderRadius = '5px';
    progressBar.style.width = '0%'; // Изначально прогресс 0%
    this.progressRange.appendChild(progressBar);

    // Добавляем прогресс-бар в элементы управления плеером

    controlsFooter.appendChild(this.timeStartElement);
    controlsFooter.appendChild(this.progressRange);
    controlsFooter.appendChild(this.timeEndElement);
 
    // Добавляем обработчики событий
    volumeIcon.addEventListener('mouseenter', () => {
      this.volumeRange!.style.display = 'flex'; // Показываем шкалу громкости при наведении
    });

    volumeIcon.addEventListener('mouseleave', () => {
      this.volumeRange!.style.display = 'none'; // Скрываем шкалу при уходе с иконки
    });

    
  // Добавляем обработчик для прокрутки колесика мыши для изменения громкости
  volumeIcon.addEventListener('wheel', (event: WheelEvent) => {
    this.handleVolumeChange(event);
  });
  }

// Метод для изменения громкости
private handleVolumeChange(event: WheelEvent): void {
  event.preventDefault();

  // Вычисляем изменение громкости
  const delta = event.deltaY > 0 ? -0.05 : 0.05;
  let newVolume = Math.max(0, Math.min(1, this.audioElement.volume + delta)); // Ограничиваем значение от 0 до 1

  // Устанавливаем новое значение громкости
  if (this.gainNode) {
    this.gainNode.gain.value = newVolume; // Устанавливаем громкость в AudioContext
  }

  // Обновляем громкость элемента audio
  this.audioElement.volume = newVolume;

  // Обновляем визуальный интерфейс шкалы громкости
  this.updateVolumeUI(newVolume);
}

// Обновление UI шкалы громкости
private updateVolumeUI(volume: number) {
  if (this.volumeRange) {
    const volumePercentage = volume * 100;
    this.volumeRange.style.height = `${(volumePercentage / 2)}px`; // Максимум 50px
  }
}

public async updateTracks(tracks: Track[]) {
  this.tracks = tracks;

  // Проверяем, существует ли текущий трек
  const currentTrack = this.tracks.find(track => track.id === this.currentTrackId);

  if (currentTrack) {
      // Если текущий трек продолжает воспроизводиться, не обновляем заголовок трека
      console.log('Текущий трек продолжает воспроизводиться:', currentTrack.name);
  } else {
      // Если текущий трек не найден в новом списке, сбрасываем на первый трек
      this.currentTrackIndex = 0;
      const newTrack = this.tracks[this.currentTrackIndex];
      this.updateTrackTitle(newTrack);
  }
}

  private handlePrevButtonClick() {
    this.pauseCurrentTrack();
    if (this.tracks.length === 0) return;
    this.currentTrackIndex = (this.currentTrackIndex - 1 + this.tracks.length) % this.tracks.length;
    this.playCurrentTrack();
}

private handleNextButtonClick() {
  this.pauseCurrentTrack(); // Останавливаем текущий трек
  if (this.tracks.length === 0) return;
  this.removeHighlightFromCurrentTrack();

  if (this.isShuffle) {
    this.playRandomTrack(); // Если shuffle включен, проигрываем случайный трек
  } else {
    this.currentTrackIndex = (this.currentTrackIndex + 1) % this.tracks.length; // Переход к следующему треку
    this.playCurrentTrack();
  }
}

private removeHighlightFromCurrentTrack() {
  if (this.currentTrackId) {
    const currentTrackElement = document.getElementById(`trackId-${this.currentTrackId}`);
    if (currentTrackElement) {
      currentTrackElement.classList.remove('highlight');
    }
  }
}


private playRandomTrack() {
  const randomIndex = Math.floor(Math.random() * this.tracks.length);
  console.log(randomIndex);
  this.currentTrackIndex = randomIndex;
  this.playCurrentTrack();
}

public playTrackByIndex(index: number): void {
  this.pauseCurrentTrack(); // Останавливаем текущий трек
  this.currentTrackIndex = index; // Устанавливаем индекс выбранного трека
  console.log('Пытается передать id ', this.currentTrackIndex);
  this.playCurrentTrack(); // Воспроизводим выбранный трек
}


  private updatePlayButtonIcon(isPlaying: boolean) {
    if (this.playButton && this.pauseButton) {
        // Показываем кнопку "Pause", если трек играет, и скрываем "Play"
        this.playButton.style.display = isPlaying ? 'none' : 'inline-block';
        this.pauseButton.style.display = isPlaying ? 'inline-block' : 'none';
    }
}

private updateTrackTitle(track: Track) {
  // Если трек воспроизводится, и новый трек не совпадает с текущим, не обновляем обложку и название
  if (this.isPlaying && this.currentTrackId !== track.id) {
    console.log('Трек воспроизводится, новый трек не совпадает с текущим, обновление не требуется.');
    return;
  }

  // Обновляем обложку и название трека
  if (this.trackImageElement) {
    this.trackImageElement.src = track.image || '';
  }
  if (this.trackNameElement) {
    this.trackNameElement.textContent = track.name || 'Неизвестный трек';
  }
  if (this.trackAuthorElement) {
    this.trackAuthorElement.textContent = track.artist.name || 'Неизвестный артист';
  }

  // Обновляем текущий трек
  this.currentTrackId = track.id;
}

  private updateTimeDisplay(elapsedTime: number, duration: number): void {
    if (this.timeStartElement && this.timeEndElement && this.progressRange) {
      // Обновляем отображение текущего времени
      this.timeStartElement.textContent = this.formatTime(elapsedTime);

      // Обновляем отображение оставшегося времени
      if (!isNaN(duration)) {
          const remainingTime = duration - elapsedTime;
          this.timeEndElement.textContent = `${this.formatTime(remainingTime)}`;
      }
// Обновляем ширину прогресс-бара
      const progressBar = this.progressRange.querySelector('.progress-bar') as HTMLElement;
      if (progressBar) {
          const progressPercentage = (elapsedTime / duration) * 100;
          progressBar.style.width = `${progressPercentage}%`; // Устанавливаем ширину прогресс-бара
      }
        }
}

private formatTime(durationSec: number): string {
  const minutes = Math.floor(durationSec / 60);
  const seconds = Math.floor(durationSec % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
}

// Конец блока для плеера


// Изменяем вызов инициализации плеера при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  await initTracks();
  playlists = await initPlaylists();

  // Загружаем треки сразу же после открытия страницы
  const tracks = tracksModel.getTracks();
  audioPlayer = new AudioPlayer(tracks); // Передаем треки в конструктор

  const header = document.getElementById('header');
  const asideList = document.getElementById('asideList');
  const trackListContainer = document.getElementById('trackList');
  const footer = document.getElementById('footer');

  if (header) {
    const userProfile = new UserProfile();
    header.appendChild(userProfile.getElement());
  }

  if (asideList) {
    const playlistPage = new PlaylistPage();
    asideList.appendChild(playlistPage.getElement());
  }

  if (trackListContainer) {
    const currentScreen = ScreenState.Tracks;
    const playTrackCallback = (track: Track) => {
      console.log(`Playing track: ${track.name}`);
      const tracks = tracksModel.getTracks();
      const trackIndex = tracks.findIndex(t => t.id === track.id);
      if (trackIndex !== -1) {
        audioPlayer.playTrackByIndex(trackIndex);
      } else {
        console.error('Track not found in the model');
      }
    };
    
    trackListPresenter = new TrackListPresenter(tracksModel, playlists, currentScreen, playTrackCallback);
    trackListPresenter.init(trackListContainer);
  }

  const searchInput = document.querySelector('.header__search__field') as HTMLInputElement;

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    console.log('Search query:', query);

    // Фильтруем треки на основе запроса
    const filteredTracks = tracksModel.getTracks().filter(track => {
      const trackTitle = (track.name || '').toLowerCase();
      const artistName = (track.artist?.name || '').toLowerCase();
      const albumTitle = (track.album?.name || '').toLowerCase();

      return trackTitle.includes(query) ||
             artistName.includes(query) ||
             albumTitle.includes(query);
    });

    console.log('Filtered tracks:', filteredTracks);

    // Переключаем экран на экран треков
    switchScreen(ScreenState.Tracks);

    // Проверяем, инициализирован ли TrackListPresenter
    if (trackListPresenter) {
      // Отображаем отфильтрованные треки
      trackListPresenter.renderTracks(filteredTracks);
    } else {
      console.error('trackListPresenter is not initialized.');
    }
  });
} else {
  console.error('Search input element not found.');
}
  setupMenuListeners();
  switchScreen(ScreenState.Tracks);

  const favoriteButton = document.getElementById('favorite');
  if (favoriteButton) {
    favoriteButton.addEventListener('click', () => {
      console.log('click');
      showFavoriteTracks();
    });
  }
});

export function switchScreen(screen: ScreenState, playlistId?: number): void {
  const mainContainer = document.querySelector('.track-list') as HTMLElement;
  mainContainer.innerHTML = '';

  let tracksToPlay: Track[] = [];

  switch (screen) {
    case ScreenState.PlaylistList:
      const playlistsComponent = new Playlists(tracksModel);
      mainContainer.appendChild(playlistsComponent.getElement());
      break;

    case ScreenState.Tracks:
      const playTrackCallback = (track: Track) => {
        console.log(`Playing track: ${track.name}`);
        const trackIndex = tracksModel.getTracks().findIndex(t => t.id === track.id);
        if (trackIndex !== -1) {
          audioPlayer.playTrackByIndex(trackIndex);
        } else {
          console.error('Track not found in full tracks list');
        }
      };

      if (trackListPresenter) {
        trackListPresenter.init(mainContainer);
        tracksToPlay = tracksModel.getTracks();
      } else {
        trackListPresenter = new TrackListPresenter(tracksModel, playlists, screen, playTrackCallback);
        trackListPresenter.init(mainContainer);
        tracksToPlay = tracksModel.getTracks();
      }
      break;

    case ScreenState.FavoriteTracks:
      tracksToPlay = tracksModel.getTracks().filter(track => track.likes && track.likes.length > 0);
      showFavoriteTracks();
      break;

    case ScreenState.Playlist:
      if (playlistId) {
        showPlaylistTracks(playlistId);
        tracksToPlay = playlists.find(p => p.id === playlistId)?.songs || [];
      }
      break;
  }

  // Не обновляем треки для экрана плейлистов
  if (screen !== ScreenState.PlaylistList) {
    if (audioPlayer) {
      audioPlayer.updateTracks(tracksToPlay);
    }
  }
}

async function showPlaylistTracks(playlistId: number): Promise<void> {
  const mainContainer = document.querySelector('.track-list') as HTMLElement;
  mainContainer.innerHTML = '';

  // Получаем плейлист с помощью асинхронного запроса
  const playlist = await fetchPlaylist(playlistId);

  // Коллбэк для воспроизведения треков в плейлисте
  const playTrackCallback = (track: Track) => {
    console.log(`Playing track: ${track.name}`);

    // Находим индекс трека внутри плейлиста
    const trackIndex = playlist.songs.findIndex((t: Track) => t.name === track.name);

    if (trackIndex !== -1) {
      console.log(`Playing track from playlist. Index: ${trackIndex}`);
      audioPlayer.playTrackByIndex(trackIndex);
    } else {
      console.error('Track not found in playlist');
    }
  };

  // Если плейлист найден
  if (playlist) {
    const currentScreen = ScreenState.Playlist;

    // Инициализируем TrackListPresenter для плейлиста
    const trackListPresenter = new TrackListPresenter(tracksModel, playlists, currentScreen, playTrackCallback, playlistId);
    trackListPresenter.init(mainContainer);

    // Рендерим треки плейлиста
    trackListPresenter.renderTracks(playlist.songs);
  } else {
    console.error('Playlist not found');
  }
}
const setupMenuListeners = () => {
  const playlistButton = document.getElementById('playlistButton');
  const tracksButton = document.getElementById('tracksButton');
  const playlistsButton = document.getElementById('playlistsButton');

  if (tracksButton) {
    tracksButton.addEventListener('click', () => {
      switchScreen(ScreenState.Tracks);
    });
  }

  if (playlistsButton) {
    playlistsButton.addEventListener('click', () => {
      switchScreen(ScreenState.PlaylistList);
    });
  }

  if (playlistButton) {
    playlistButton.addEventListener('click', () => {
      switchScreen(ScreenState.Playlist);
    });
  }
};

export async function showFavoriteTracks(): Promise<void> {
  const playTrackCallback = (track: Track) => {
    console.log(`Playing favorite track: ${track.name}`);

    // Находим индекс трека в списке любимых треков
    const favoriteTracks = tracksModel.getTracks().filter((track: Track) => track.likes && track.likes.length > 0);
    const trackIndexInFavorites = favoriteTracks.findIndex((t: Track) => t.id === track.id);

    if (trackIndexInFavorites !== -1) {
      console.log(`Playing track with index in favorites list: ${trackIndexInFavorites}`);
      audioPlayer.playTrackByIndex(trackIndexInFavorites);
    } else {
      console.error('Track not found in the favorites list');
    }
  };

  try {
    // Загружаем все треки
    const tracks = await fetchTracks(); 
    tracksModel.setTracks(tracks); 

    // Фильтруем треки, чтобы оставить только любимые
    const favoriteTracks = tracksModel.getTracks().filter((track: Track) => track.likes && track.likes.length > 0);

    // Очищаем контейнер для списка треков
    const mainContainer = document.querySelector('.track-list') as HTMLElement;
    mainContainer.innerHTML = ''; 

    const currentScreen = ScreenState.FavoriteTracks;
    
    // Инициализируем TrackListPresenter для любимых треков
    const trackListPresenter = new TrackListPresenter(tracksModel, playlists, currentScreen, playTrackCallback);
    trackListPresenter.init(mainContainer);

    // Рендерим список любимых треков
    trackListPresenter.renderTracks(favoriteTracks);

  } catch (error) {
    console.error('Ошибка при загрузке треков:', error);
  }
}


// function updateFooterPlayer(screenState: ScreenState) {
//   const tracks = tracksModel.getTracks();
//   const updatedTrack = tracks.length > 0 ? tracks[0] : null;

//   if (updatedTrack && footerPlayer) {
//     footerPlayer.updateTrack(updatedTrack);
//   } else {
//     console.error('FooterPlayer is not initialized or no track available.');
//   }
// }

//   if (footer) {
//     const currentUserName = 'Po';
//     const tracks = tracksModel.getTracks();
//     if (tracks.length > 0) {
//         footerPlayer = new FooterPlayer(tracks, currentTrackIndex, ScreenState.Tracks, currentUserName);
//         footer.appendChild(footerPlayer.getElement());
//     } else {
//         console.error("No track available to display.");
//     }
// }

// function setupButtons() {
//   const nextButton = document.querySelector('.player__skipnext-btn') as HTMLButtonElement;
//   const backButton = document.querySelector('.player__skipback-btn') as HTMLButtonElement;
//   const playButton = document.querySelector('.player__play-btn') as HTMLButtonElement;

//   if (nextButton) {
//       nextButton.addEventListener('click', handleNextButtonClick);
//   }

//   if (backButton) {
//       backButton.addEventListener('click', handleBackButtonClick);
//   }

//   if (playButton) {
//       playButton.addEventListener('click', handlePlayButtonClick);
//   }
// }

// function handleNextButtonClick() {
//   console.log('Next button clicked');
//   const tracks = tracksModel.getTracks();
//   if (tracks.length > 0) {
//     currentTrackIndex = (currentTrackIndex + 1) % tracks.length; // Перейти к следующему треку, зацикливаемся
//     console.log(currentTrackIndex);
//     updateFooterPlayer(ScreenState.Tracks, currentTrackIndex); // Обновляем FooterPlayer
//   }
// }

// function handleBackButtonClick() {
//   console.log('Back button clicked');
//   const tracks = tracksModel.getTracks();
//   if (tracks.length > 0) {
//     currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length; // Перейти к предыдущему треку, зацикливаемся
//     console.log(currentTrackIndex);
//     updateFooterPlayer(ScreenState.Tracks, currentTrackIndex); // Обновляем FooterPlayer
//   }
// }

// function handlePlayButtonClick() {
//   console.log('Play button clicked');
//   // Логика для кнопки "воспроизвести"
// }


  // private initializeAudioContext() {
  //   if (this.audioContext == null) {
  //     this.audioContext = new AudioContext();
  //   }

  //   if (this.audioContext.state === 'suspended') {
  //     this.audioContext.resume();
  //   }

  //   this.gainNode = this.audioContext.createGain();
  //   this.gainNode.connect(this.audioContext.destination);
  // }

  // private updatePlayButtonIcon(isPlaying: boolean) {
//   if (this.playButton) {
//       if (isPlaying) {
//           this.playButton.innerHTML = `
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <rect width="24" height="24" fill="white"/>
//                   <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM14 8C14.5523 8 15 8.44772 15 9L15 15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15L13 9C13 8.44772 13.4477 8 14 8ZM10 8C10.5523 8 11 8.44772 11 9L11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15L9 9C9 8.44772 9.44772 8 10 8Z" fill="#323232"/>
//               </svg>`;
//       } else {
//           this.playButton.innerHTML = `
//               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                   <rect width="24" height="24" fill="white"/>
//                   <path fill-rule="evenodd" clip-rule="evenodd" d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM14 8C14.5523 8 15 8.44772 15 9L15 15C15 15.5523 14.5523 16 14 16C13.4477 16 13 15.5523 13 15L13 9C13 8.44772 13.4477 8 14 8ZM10 8C10.5523 8 11 8.44772 11 9L11 15C11 15.5523 10.5523 16 10 16C9.44771 16 9 15.5523 9 15L9 9C9 8.44772 9.44772 8 10 8Z" fill="#323232"/>
//               </svg>`;
//       }
//   }
// }

//   private isPlaying = false;

//   private async handlePlayButtonClick() {
//     if (!this.audioContext) return;

//     try {
//         console.log('Attempting to play...');

//         // Возобновляем контекст аудио
//         await this.audioContext.resume();

//         // Попытка воспроизведения
//         const playPromise = this.audioElement.play();
        
//         if (playPromise !== undefined) {
//             await playPromise;
//             console.log('Playback started');
//             this.isPlaying = true;
//             // Обновите UI кнопок при воспроизведении
//             this.updatePlayButtonIcon(true); // Иконка "пауза"
//         }
//     } catch (error) {
//         console.error('Ошибка при воспроизведении:', error);
//     }
// }

  // private handlePauseButtonClick() {
  //   if (!this.audioContext) return;

  //   try {
  //     console.log('Attempting to pause...');
  //     this.audioElement.pause();
  //     console.log('Playback paused');
  //     this.isPlaying = false;
  //     this.updatePlayButtonIcon(false); // Обновляем иконку кнопки
  //   } catch (error) {
  //     console.error('Ошибка при постановке на паузу:', error);
  //   }
  // }

    // Добавляем обработчики событий для кнопок
    // if (this.playButton) {
    //   this.playButton.addEventListener('click', this.handlePlayButtonClick.bind(this));
    // }

    // if (this.pauseButton) {
    //   this.pauseButton.addEventListener('click', this.handlePauseButtonClick.bind(this));
    // }

//   private initializeAudioContext() {
//     if (this.audioContext === null) {
//         this.audioContext = new AudioContext();
//     }

//     if (this.audioContext.state === 'suspended') {
//         this.audioContext.resume();
//     }

//     this.gainNode = this.audioContext.createGain();
//     this.gainNode.connect(this.audioContext.destination);

//     // Инициализация кнопок управления воспроизведением и паузой
//     // this.playButton = document.querySelector('#playButton') as HTMLButtonElement;
//     // if (this.playButton) {
//     //     this.playButton.addEventListener('click', this.handlePlayButtonClick.bind(this));
//     // }

//     // this.pauseButton = document.querySelector('#pauseButton') as HTMLButtonElement; // Инициализация кнопки паузы
//     // if (this.pauseButton) {
//     //     this.pauseButton.addEventListener('click', this.handlePauseButtonClick.bind(this));
//     // }
// }


  // private async playCurrentTrack() {
  //   if (this.tracks.length === 0) return;

  //   const currentTrack = this.tracks[this.currentTrackIndex];
  //   this.currentTrack = currentTrack;

  //   // Загрузка трека с API
  //   try {
  //     const response = await fetch(`http://localhost:3000${currentTrack.path}`);
  //     const arrayBuffer = await response.arrayBuffer();
  //     const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);

  //     // Остановка предыдущего трека, если он был
  //     if (this.sourceNode) {
  //       this.sourceNode.stop();
  //     }

  //     // Создание нового источника и подключение к gainNode
  //     this.sourceNode = this.audioContext!.createBufferSource();
  //     this.sourceNode.buffer = audioBuffer;
  //     this.sourceNode.connect(this.gainNode!);
  //     this.sourceNode.start();

  //     // Обновляем длительность трека
  //     this.timeEndElement!.textContent = this.formatTime(audioBuffer.duration);

  //     this.updateTrackTitle(currentTrack);
  //   } catch (error) {
  //     console.error('Error loading or decoding audio data', error);
  //   }
  // }