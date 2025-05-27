import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import { lessons } from "@/data/lessons";

const CadastrarAulas = () => {
  useEffect(() => {
    const cadastrar = async () => {
      for (const aula of lessons) {
        const aulaRef = doc(db, "aulas", `aula-${String(aula.id).padStart(2, "0")}`);
        await setDoc(aulaRef, {
          numero: aula.id,
          titulo: aula.title,
          resumo: aula.summary,
          explicacao: aula.explanation,
          exemplo: aula.example,
          exerciciosTeoricos: aula.theoreticalExercises,
          exerciciosPraticos: aula.practicalExercises
        });
      }
      alert("Aulas cadastradas com sucesso!");
    };

    cadastrar();
  }, []);

  return <div className="p-6 text-center">Cadastrando aulas no Firestore...</div>;
};

export default CadastrarAulas;
