export interface AnnotationBounds {
  /** Percentages of the exact screenshot dimensions. */
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Annotation {
  x?: number;
  y?: number;
  targetX?: number;
  targetY?: number;
  bounds?: AnnotationBounds;
  label: string;
}
export interface Step {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  notes: string[];
  verification: string;
  status: 'historical' | 'live' | 'pending';
  screenshot?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    annotations: Annotation[];
  };
}
export interface Guide {
  title: string;
  subtitle: string;
  updated: string;
  liveStatus: string;
  steps: Step[];
  questions: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
}
