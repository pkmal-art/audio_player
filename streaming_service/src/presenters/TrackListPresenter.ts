import { TrackItem } from '../components/track-list/trackList';
import { Track } from '../components/track-list/trackList';
import { UserAction } from '../model/userActions';
import { Tracks } from '../model/tracks';
import { PlaylistApiModel } from '../model/playlistApiModel';
import { ScreenState } from '../index';

export class TrackListPresenter {
  private trackListComponent: HTMLElement;
  private playlists: PlaylistApiModel[];
  private currentScreen: ScreenState;
  private currentPlaylistId?: number;

  // Добавим новый параметр для передачи трека в плеер
  constructor(private tracksModel: Tracks, playlists: PlaylistApiModel[], currentScreen: ScreenState, private playTrackCallback: (track: Track) => void, playlistId?: number) {
    this.trackListComponent = document.createElement('div');
    this.playlists = playlists;
    this.currentScreen = currentScreen;
    this.currentPlaylistId = playlistId;
  }

  init(container: HTMLElement): void {
    container.append(this.trackListComponent);
    this.renderTracks();
  }

  renderTracks(tracks: Track[] = this.tracksModel.getTracks()): void {
    this.trackListComponent.innerHTML = ''; 

    tracks.forEach((track, index) => {
      const trackItem = new TrackItem(
        track,
        index + 1,
        this.updateTrackData.bind(this),
        this.handleUserAction.bind(this),
        this.selectTrack.bind(this),  // Добавляем обработчик для выбора трека
        'Po', // имя пользователя
        this.currentScreen,
        this.currentPlaylistId
      );
      this.trackListComponent.append(trackItem.getElement());
    });
  }

  private updateTrackData(updatedTrack: Track): void {
    this.tracksModel.updateTrack(updatedTrack);
    this.renderTracks();
  }

  // Новый метод для обработки выбора трека
  private selectTrack(track: Track): void {
    console.log('click');
    // Передаем выбранный трек в плеер
    this.playTrackCallback(track);
  }

  

  private handleUserAction(action: UserAction, track: Track): void {
    switch (action) {
      case UserAction.DELETE_TRACK:
        this.tracksModel.deleteTrack(track.id);

        this.playlists.forEach(playlist => {
          playlist.songs = playlist.songs.filter(t => t.id !== track.id);
        });
        this.renderTracks();
        break;

      default:
        console.warn(`Неизвестное действие пользователя: ${action}`);
    }
  }
}
