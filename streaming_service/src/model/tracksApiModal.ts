import { Playlists, PlaylistApiModel } from './playlistApiModel';

// export interface TrackApi {
//   album:{};
//   artist:{};
//   createdAt:  string;
//   duration: number;
//   filename:string;
//   id:number;
//   image:string;
//   likes:[]
//   name:string;
//   path:string;
// }

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


export class TracksApi {
  private tracks: TrackApi[] = [];
  private playlists: PlaylistApiModel[] = [];
  private filter: string = '';

  
  public setTracks(tracks: TrackApi[]): void {
    this.tracks = tracks;
  }

  public setFilter(query: string): void {
    this.filter = query;
  }

  public getTracks(): TrackApi[] {
    if (!this.filter) {
      return this.tracks;
    }
    return this.tracks.filter(track => 
      track.name.toLowerCase().includes(this.filter) 
      // || track.artist.toLowerCase().includes(this.filter) ||
      //track.album.toLowerCase().includes(this.filter)
    );
  }


  public updateTrack(updatedTrack: TrackApi): void {
    const index = this.tracks.findIndex(track => track.name === updatedTrack.name);
    if (index !== -1) {
      this.tracks[index] = updatedTrack;
    }
  }


  public addTrack(track: TrackApi): void {
    this.tracks.push(track);
  }

  public deleteTrack(trackId: number): void {
    this.tracks = this.tracks.filter(track => track.id !== trackId);
  }

   setPlaylists(playlists: PlaylistApiModel[]): void {
    this.playlists = playlists;
  }

  // updateTrackLike(trackId: number, isFavorite: []): void {

  //   const track = this.tracks.find(track => track.id === trackId);
  //   if (track) {
  //     track.isFavorite = isFavorite;
     
  //     this.updatePlaylists(trackId, isFavorite);
  //   }
  // }

  //  private updatePlaylists(trackId: string, isFavorite: []): void {
  //   this.playlists.forEach(playlist => {
  //     playlist.tracks.forEach(track => {
  //       if (track.id === trackId) {
  //         track.isFavorite = isFavorite;
  //       }
  //     });
  //   });
  // }
}