import { TrackItem } from '../components/track-list/trackList';
import { Track } from '../components/track-list/trackList';
import { UserAction } from '../model/userActions';

export class TrackPresenter {
  private trackComponent: TrackItem;

  constructor(
    private trackData: Track,
    private trackNumber: number,
    private onLikeButtonClick: (updatedTrack: Track) => void,
    private onAction: (action: UserAction, track: Track) => void 
  ) {
    this.trackComponent = new TrackItem(this.trackData, this.trackNumber, this.onLikeButtonClick, this.onAction);
  }

  init(container: HTMLElement): void {
    container.append(this.trackComponent.getElement());
    this.trackComponent.setEventListeners();
  }
}

