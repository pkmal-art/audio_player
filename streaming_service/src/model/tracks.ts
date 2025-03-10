
import { Track } from "../components/track-list/trackList";
import { Playlists, Playlist } from './playlist';


export class Tracks {
  
  private tracks: Track[] = [];
  private playlists: Playlist[] = [];
  private filter: string = '';

  
  public setTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  public setFilter(query: string): void {
    this.filter = query;
  }

  public getTracks(): Track[] {
    if (!this.filter) {
      return this.tracks;
    }
    return this.tracks.filter(track => 
      track.name.toLowerCase().includes(this.filter) 
      // ||
      // track.artist.toLowerCase().includes(this.filter) ||
      // track.album.toLowerCase().includes(this.filter)
    );
  }


  public updateTrack(updatedTrack: Track): void {
    const index = this.tracks.findIndex(track => track.name === updatedTrack.name);
    if (index !== -1) {
      this.tracks[index] = updatedTrack;
    }
  }


  public addTrack(track: Track): void {
    this.tracks.push(track);
  }

  public deleteTrack(trackId: number): void {
    this.tracks = this.tracks.filter(track => track.id !== trackId);
  }

   setPlaylists(playlists: Playlist[]): void {
    this.playlists = playlists;
  }

  updateTrackLike(trackId: number, isFavorite: boolean): void {

    const track = this.tracks.find(track => track.id === trackId);
    // if (track) {
    //   //track.isFavorite = isFavorite;
     
    //   this.updatePlaylists(trackId, isFavorite);
    // }
  }

   private updatePlaylists(trackId: string, isFavorite: boolean): void {
    this.playlists.forEach(playlist => {
      // playlist.tracks.forEach(track => {
      //   if (track.id === trackId) {
      //     track.isFavorite = isFavorite;
      //   }
      // });
    });
  }
}


    
  /*
  public updateTrack(updatedTrack: Track): void {
    this.tracks = this.tracks.map(track =>
      track.id === updatedTrack.id ? updatedTrack : track
    );
  }
    

  public updateTrack(updatedTrack: Track): void {
    const index = this.tracks.findIndex(track => track.trackName === updatedTrack.trackName);
    if (index !== -1) {
      this.tracks[index] = updatedTrack;
    }
  }
    */

