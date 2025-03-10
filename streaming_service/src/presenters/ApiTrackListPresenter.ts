import { TrackItemApi } from '../components/track-list/trackListApi';
import { TrackApi } from '../components/track-list/trackListApi';
import { UserAction } from '../model/userActions';
import { TracksApi } from '../model/tracksApiModal';
import { PlaylistApiModel } from '../model/playlistApiModel';

export class TrackListPresenter {
  private trackListComponent: HTMLElement;
  private playlists: PlaylistApiModel[]; 

  constructor(private tracksModel: TracksApi, playlists: PlaylistApiModel[]) {
    this.trackListComponent = document.createElement('div');
    this.playlists = playlists; 
  }

  init(container: HTMLElement): void {
    container.append(this.trackListComponent);
    //this.renderTracks(); 
  }

  // renderTracks(tracks: TrackApi[] = this.tracksModel.getTracks()): void {
  //   this.trackListComponent.innerHTML = '';
  //   console.log('Current tracks:', tracks);

  //   tracks.forEach((track, index) => {
  //     const trackItem = new TrackItemApi(
  //       track, 
  //       index + 1, 
  //       this.updateTrackData.bind(this), 
  //       this.handleUserAction.bind(this) 
  //     );
  //     this.trackListComponent.append(trackItem.getElement());
  //   });
  // }

  // private updateTrackData(updatedTrack: TrackApi): void {
  //   this.tracksModel.updateTrack(updatedTrack);

  //   // Обновляем все плейлисты
  //   this.playlists.forEach(playlist => {
  //     playlist.songs.forEach(trackInPlaylist => {
  //       if (trackInPlaylist.id === updatedTrack.id) {
  //         trackInPlaylist.isFavorite = updatedTrack.isFavorite;
  //       }
  //     });
  //   });

  //   this.renderTracks(); 
  // }

  private handleUserAction(action: UserAction, track: TrackApi): void {
    switch (action) {
      case UserAction.DELETE_TRACK:
        this.tracksModel.deleteTrack(track.id); 
       
        this.playlists.forEach(playlist => {
          playlist.songs = playlist.songs.filter(t => t.id !== track.id);
        });
        //this.renderTracks();
        break;
      
    }
  }
}