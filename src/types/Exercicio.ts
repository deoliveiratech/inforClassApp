export type ExercicioTeorico =
  | {
      tipo: "texto";
      enunciado: string;
    }
  | {
      tipo: "multipla";
      enunciado: string;
      alternativas: string[];
      correta: number;
    }
  | {
    tipo: "multipla-multipla"; enunciado: string; alternativas: string[]; corretas: number[]
  };
