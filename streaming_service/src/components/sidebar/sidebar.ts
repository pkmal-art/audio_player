import { Component } from '../components';
import { Track } from "../track-list/trackList";
import { PlaylistApiModel } from '../../model/playlistApiModel';
import { fetchTracks, addTrackToPlaylist } from '../../apiService';

export class Sidebar extends Component {
  private playlists: PlaylistApiModel[]; 
  private track: Track; 

  constructor(track: Track, playlists: PlaylistApiModel[]) {
    super();
    this.track = track;
    this.playlists = playlists; 
    
    // Создаем кастомное модальное окно
    this.createCustomAlert();
  }

  getTemplate(): string {
    return this.playlists.map(playlist => `
      <div class="playlists-modal__playlist" data-playlist-id="${playlist.id}">
        <img src="img/playlists__1440 (4).jpg" alt="${playlist.name}" class="playlists-modal__playlist__image"/>
        <div class="playlists-modal__playlist__title">${playlist.name}</div>
        <div class="playlists-modal__playlist__info">${playlist.songs.length} треков</div>
      </div>
    `).join('');
  }

  addEventListeners(): void {
    const playlistElements = document.querySelectorAll('.playlists-modal__playlist');
    playlistElements.forEach(element => {
      element.addEventListener('click', this.handlePlaylistClick.bind(this));
    });
  }

  private async handlePlaylistClick(event: Event): Promise<void> {
    const target = event.currentTarget as HTMLElement;
    const playlistId = target.getAttribute('data-playlist-id');

    if (playlistId) {
      await this.addTrackToPlaylist(Number(playlistId)); 
      this.closeSidebar();
    }
  }

  private async addTrackToPlaylist(playlistId: number): Promise<void> {
    const playlist = this.playlists.find(pl => pl.id === playlistId);
    if (playlist) {
      const trackExists = playlist.songs.some(existingTrack => existingTrack.id === this.track.id);
      
      if (!trackExists) {
        try {
          await addTrackToPlaylist(playlistId, this.track.id);
          playlist.songs.push(this.track); 
          this.updatePlaylistInfo(playlistId, playlist);
        } catch (error) {
          console.error('Ошибка при добавлении трека в плейлист', error);
        }
      } else {
        this.showCustomAlert('Трек уже существует в плейлисте');
      }
    }
  }

  private updatePlaylistInfo(playlistId: number, playlist: PlaylistApiModel): void {
    const target = document.querySelector(`[data-playlist-id="${playlistId}"]`);
    const playlistInfo = target?.querySelector('.playlists-modal__playlist__info');
    if (playlistInfo) {
      playlistInfo.textContent = `${playlist.songs.length} треков`;
    }
  }

  private closeSidebar(): void {
    setTimeout(() => {
      const modalElement = document.querySelector('.playlists-modal') as HTMLElement;
      if (modalElement) {
        modalElement.classList.remove('show');
      }
    }, 500);
  }

  // Создаем модальное окно для кастомного алерта
  private createCustomAlert() {
    // Проверка на существование модального окна, чтобы не создавать его дважды
    if (!document.getElementById('custom-alert')) {
      const modal = document.createElement('div');
      modal.id = 'custom-alert';
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
      modal.style.padding = '20px';
      modal.style.backgroundColor = 'white';
      modal.style.border = '1px solid #ccc';
      modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
      modal.style.zIndex = '1000';
      modal.style.display = 'none'; // Скрыто по умолчанию
      modal.style.flexDirection = 'column';
      modal.style.alignItems = 'center';
      modal.style.textAlign = 'center';
  
      // Создаем элемент для отображения сообщения
      const message = document.createElement('span');
      message.id = 'alert-message';
      modal.appendChild(message);
  
      // Создаем кнопку для закрытия модального окна
      const okButton = document.createElement('button');
      okButton.id = 'alert-ok-button';
      okButton.textContent = 'OK';
      okButton.style.marginTop = '10px';
      okButton.style.padding = '5px 10px';
      okButton.style.cursor = 'pointer';
      
      okButton.addEventListener('click', () => {
        modal.style.display = 'none';
      });
  
      modal.appendChild(okButton);
  
      // Добавляем модальное окно в тело документа
      document.body.appendChild(modal);
    }
  }
  
  private showCustomAlert(message: string) {
    const alertElement = document.getElementById('custom-alert');
    const alertMessageElement = document.getElementById('alert-message');
  
    if (alertElement && alertMessageElement) {
      alertMessageElement.textContent = message;
      alertElement.style.display = 'flex'; // Показываем модальное окно
    }
  }
}
