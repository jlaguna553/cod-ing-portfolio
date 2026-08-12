'use client';

import { useLessonStore, type LocalizedLesson } from '@/stores/useLessonStore';

/**
 * Puente servidor → store. No renderiza nada.
 *
 * El servidor resuelve la lección al idioma de la URL y la pasa por props;
 * este componente la empuja al store ANTES de que los paneles rendericen, de
 * ahí que la llamada vaya en el cuerpo del render y no en un `useEffect`:
 * con efecto habría un frame con los paneles vacíos en cada carga.
 *
 * Mutar un store externo durante el render es aceptable aquí porque
 * `syncLesson` es idempotente y no dispara re-render de este componente.
 */
export function LessonBoot({ lesson }: { lesson: LocalizedLesson }) {
  useLessonStore.getState().syncLesson(lesson);
  return null;
}
