import { Track } from "../components/track-list/trackList";

export class PlaylistTracks {
  private tracks: Track[] = [];

  public setTracks(tracks: Track[]): void {
    this.tracks = tracks;
  }

  public getTracks(): Track[] {
    return this.tracks;
  }

  public addTrack(track: Track): void {
    this.tracks.push(track);
  }

  public deleteTrack(trackId: number): void {
    this.tracks = this.tracks.filter(track => track.id !== trackId);
  }

  public updateTrack(updatedTrack: Track): void {
    const index = this.tracks.findIndex(track => track.id === updatedTrack.id);
    if (index !== -1) {
      this.tracks[index] = updatedTrack;
    }
  }
}