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
  }
  | {
      tipo: "relacione";
      enunciado: string;
      colunaA: string[];
      colunaB: string[];
      correspondencias: number[]; // índice de colunaB para cada item de colunaA
    };
