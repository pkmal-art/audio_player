import { Track } from '../components/track-list/trackList';
import { Tracks } from '../model/tracks';

export class SearchPresenter {
  private searchInput: HTMLInputElement;

  constructor(private onSearch: (query: string) => void) {
    this.searchInput = document.querySelector('.header__search__field') as HTMLInputElement;

    if (this.searchInput) {
      this.setEventListeners();
    } else {
      console.error('Search input element not found');
    }
  }

  private setEventListeners(): void {
    this.searchInput.addEventListener('input', () => {
      const query = this.searchInput.value.trim().toLowerCase();
      this.onSearch(query);
    });
  }
}
