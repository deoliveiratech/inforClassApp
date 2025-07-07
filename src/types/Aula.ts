
import type { ExercicioTeorico } from "./Exercicio";

export type Aula = {
  id: number;
  titulo: string;
  numero: string;
  explanation: string;
  exemplo: string;
  exerciciosTeoricos: ExercicioTeorico[];
  exerciciosPraticos: string[];
};
