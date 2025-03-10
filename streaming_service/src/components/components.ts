//import { createElement } from '../utils';
export abstract class Component {
  protected element: HTMLElement | null = null;

  abstract getTemplate(): string;

  getElement(): HTMLElement {
    if (!this.element) {
      this.element = this.createElement(this.getTemplate());
    }
    return this.element;
  }

  removeElement(): void {
    this.element = null;
  }

  private createElement(template: string): HTMLElement {
    const newElement = document.createElement('div');
    newElement.innerHTML = template;
    return newElement.firstElementChild as HTMLElement;
  }

}
