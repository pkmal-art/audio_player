import { Track } from '../components/track-list/trackList';

export class PlayerModel {
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;

  constructor(initialTrack: Track | null = null) {
    this.currentTrack = initialTrack;
  }

  public setTrack(track: Track) {
    this.currentTrack = track;
    this.currentTime = 0;
  }

  public getTrack(): Track | null {
    return this.currentTrack;
  }

  public setPlaying(status: boolean) {
    this.isPlaying = status;
  }

  public isPlayingStatus(): boolean {
    return this.isPlaying;
  }

  public setCurrentTime(time: number) {
    this.currentTime = time;
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getDuration(): number {
    return this.currentTrack ? this.currentTrack.duration : 0;
  }
}