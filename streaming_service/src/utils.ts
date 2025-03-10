export function createElement(template: string): HTMLElement {
  const newElement = document.createElement('div');
  newElement.innerHTML = template.trim();
  return newElement.firstChild as HTMLElement;
}
