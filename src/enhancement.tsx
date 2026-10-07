import { createRoot } from 'react-dom/client';
import { Checklist } from './components/Checklist';
import type { Step } from './types';
const storageKey = 'pressguide:checklist:v1';
let savedProgress: string[] = [];
try {
  const stored: unknown = JSON.parse(
    sessionStorage.getItem(storageKey) || '[]',
  );
  if (Array.isArray(stored) && stored.every((id) => typeof id === 'string'))
    savedProgress = stored;
} catch {
  /* Session memory remains available when storage is unavailable. */
}

export function openChecklist(
  container: HTMLElement,
  steps: Pick<Step, 'id' | 'title'>[],
  trigger: HTMLButtonElement,
) {
  savedProgress = savedProgress.filter((id) =>
    steps.some((step) => step.id === id),
  );
  const root = createRoot(container);
  root.render(
    <Checklist
      steps={steps}
      initialChecked={savedProgress}
      onProgress={(checked) => {
        savedProgress = checked;
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(checked));
        } catch {
          /* Keep the in-memory progress. */
        }
      }}
      onClose={() => {
        root.unmount();
        trigger.focus();
      }}
    />,
  );
}
