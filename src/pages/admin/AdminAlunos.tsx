import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

type Aluno = {
  uid: string;
  nome: string;
  email: string;
  cursoId: string;
};

type Curso = {
  id: string;
  nome: string;
};

type ProgressoAluno = {
  [aulaId: string]: {
    status: "concluida" | "em_andamento" | "nao_iniciada";
  };
};

const AdminAlunos = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const navigate = useNavigate();
  const [cursos, setCursos] = useState<Record<string, Curso>>({});
  const [dadosProgresso, setDadosProgresso] = useState<
    Record<string, { concluida: number; andamento: number; total: number }>
  >({});

  useEffect(() => {
    const carregarDados = async () => {
      const [alunosSnap, cursosSnap, aulasSnap] = await Promise.all([
        getDocs(collection(db, "alunos")),
        getDocs(collection(db, "cursos")),
        getDocs(collection(db, "aulas")),
      ]);

      const cursosObj: Record<string, Curso> = {};
      cursosSnap.forEach((doc) => {
        cursosObj[doc.id] = { id: doc.id, nome: doc.data().nome };
      });

      const totalAulas = aulasSnap.size;

      const alunosLista = alunosSnap.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as Aluno[];

      const progressoFinal: Record<string, { concluida: number; andamento: number; total: number }> = {};

      for (const aluno of alunosLista) {
        const progDoc = await getDoc(doc(db, "progresso", aluno.uid));
        const progresso: ProgressoAluno = progDoc.exists() ? progDoc.data() : {};
        const statusList = Object.values(progresso).map((p) => p.status);

        const concluida = statusList.filter((s) => s === "concluida").length;
        const andamento = statusList.filter((s) => s === "em_andamento").length;

        progressoFinal[aluno.uid] = {
          concluida,
          andamento,
          total: totalAulas,
        };
      }

      setCursos(cursosObj);
      setAlunos(alunosLista);
      setDadosProgresso(progressoFinal);
    };

    carregarDados();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Progresso dos Alunos</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Aluno</th>
              <th className="p-2">Email</th>
              <th className="p-2">Curso</th>
              <th className="p-2">Concluídas</th>
              <th className="p-2">Em Andamento</th>
              <th className="p-2">Restantes</th>
              <th className="p-2">Progresso (%)</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((aluno) => {
              const prog = dadosProgresso[aluno.uid] || { concluida: 0, andamento: 0, total: 1 };
              const restantes = prog.total - prog.concluida;
              const porcentagem = ((prog.concluida / prog.total) * 100).toFixed(0);
              return (
                <tr key={aluno.uid} className="border-t">
                  <td className="p-2">{aluno.nome}</td>
                  <td className="p-2">{aluno.email}</td>
                  <td className="p-2">{cursos[aluno.cursoId]?.nome || "—"}</td>
                  <td className="p-2">{prog.concluida}</td>
                  <td className="p-2">{prog.andamento}</td>
                  <td className="p-2">{restantes}</td>
                  <td className="p-2">{porcentagem}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button
          onClick={() => navigate("/admin/prof-dashboard")}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
    </div>
  );
};

export default AdminAlunos;
