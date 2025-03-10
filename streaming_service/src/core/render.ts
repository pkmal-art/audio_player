import { Component } from '../components/components';

export enum RenderPosition {
  BEFOREBEGIN = 'beforebegin',
  AFTERBEGIN = 'afterbegin',
  BEFOREEND = 'beforeend',
  AFTEREND = 'afterend'
}

export function render(
  container: HTMLElement,
  component: Component,
  position: RenderPosition = RenderPosition.BEFOREEND
): void {
  switch (position) {
    case RenderPosition.BEFOREBEGIN:
      container.insertAdjacentElement(RenderPosition.BEFOREBEGIN, component.getElement());
      break;
    case RenderPosition.AFTERBEGIN:
      container.insertAdjacentElement(RenderPosition.AFTERBEGIN, component.getElement());
      break;
    case RenderPosition.BEFOREEND:
      container.insertAdjacentElement(RenderPosition.BEFOREEND, component.getElement());
      break;
    case RenderPosition.AFTEREND:
      container.insertAdjacentElement(RenderPosition.AFTEREND, component.getElement());
      break;
  }
}