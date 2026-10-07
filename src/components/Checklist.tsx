import { useState } from 'react';
import {
  Checkbox,
  MantineProvider,
  Modal,
  Progress,
  Stack,
  Text,
  createTheme,
} from '@mantine/core';
import type { Step } from '../types';

const theme = createTheme({
  fontFamily: 'var(--font-body)',
  fontSizes: {
    xs: '1rem',
    sm: '1rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  primaryColor: 'teal',
  focusClassName: 'brand-focus',
  defaultRadius: 'sm',
});

export function Checklist({
  steps,
  onClose,
  initialChecked,
  onProgress,
}: {
  steps: Pick<Step, 'id' | 'title'>[];
  onClose: () => void;
  initialChecked: string[];
  onProgress: (checked: string[]) => void;
}) {
  const [checked, setChecked] = useState(initialChecked);
  return (
    <MantineProvider theme={theme}>
      <Modal
        opened
        onClose={onClose}
        title="Kişisel kontrol listesi"
        centered
        size="md"
        closeButtonProps={{ 'aria-label': 'Kontrol listesini kapat' }}
        classNames={{
          content: 'checklist-surface',
          title: 'checklist-title',
          header: 'checklist-header',
          close: 'checklist-close',
        }}
      >
        <Stack>
          <Text>
            Bu liste bu oturumdaki ilerlemenizi takip eder. İşaretlemek,
            sunucuda bir işlemin başarıyla çalıştığını kanıtlamaz.
          </Text>
          <Progress
            value={steps.length ? (checked.length / steps.length) * 100 : 0}
            aria-label="Tamamlanan adımlar"
          />
          <Text>
            {checked.length} / {steps.length} adım işaretlendi
          </Text>
          {steps.map((step) => (
            <Checkbox
              key={step.id}
              label={step.title}
              checked={checked.includes(step.id)}
              onChange={(event) => {
                const selected = event.currentTarget.checked;
                const next = selected
                  ? [...checked, step.id]
                  : checked.filter((id) => id !== step.id);
                setChecked(next);
                onProgress(next);
              }}
              classNames={{
                root: 'checklist-item',
                label: 'checklist-label',
                input: 'checklist-input',
              }}
            />
          ))}
        </Stack>
      </Modal>
    </MantineProvider>
  );
}
