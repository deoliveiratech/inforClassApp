import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const registrarPresenca = async ({
  alunoId,
  nomeAluno,
  aulaId,
  nomeAula,
  statusAula
}: {
  alunoId: string;
  nomeAluno: string;
  aulaId: string;
  nomeAula: string;
  statusAula: "em andamento" | "concluída";
}) => {
  try {
    await addDoc(collection(db, "presencas"), {
      alunoId,
      nomeAluno,
      aulaId,
      nomeAula,
      statusAula,
      dataHora: Timestamp.now()
    });
    console.log("Presença registrada com sucesso");
  } catch (error) {
    console.error("Erro ao registrar presença:", error);
  }
};

