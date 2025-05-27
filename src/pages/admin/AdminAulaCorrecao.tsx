import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

type AulaData = {
  numero: number;
  titulo: string;
  exerciciosTeoricos: string[];
  exerciciosPraticos: string[];
};

type Aluno = {
  uid: string;
  nome: string;
  email: string;
};

type RespostaAluno = {
  uid: string;
  nome: string;
  email: string;
  respostasTeoricas: string[];
  uploads: (string | null)[];
};

const AdminAulaCorrecao = () => {
  const { id } = useParams(); // aula ID ex: aula-01
  const [aula, setAula] = useState<AulaData | null>(null);
  const [respostas, setRespostas] = useState<RespostaAluno[]>([]);

  useEffect(() => {
    const carregarDados = async () => {
      const aulaDoc = await getDoc(doc(db, "aulas", id!));
      if (aulaDoc.exists()) setAula(aulaDoc.data() as AulaData);

      const alunosSnap = await getDocs(collection(db, "alunos"));
      const progressoSnap = await getDocs(collection(db, "progresso"));

      const alunosMap: Record<string, Aluno> = {};
      alunosSnap.forEach((doc) => {
        const data = doc.data();
        alunosMap[doc.id] = {
          uid: doc.id,
          nome: data.nome,
          email: data.email,
        };
      });

      const lista: RespostaAluno[] = [];
      progressoSnap.forEach((doc) => {
        const progresso = doc.data();
        if (progresso[id!]) {
          lista.push({
            uid: doc.id,
            nome: alunosMap[doc.id]?.nome || "Aluno não encontrado",
            email: alunosMap[doc.id]?.email || "—",
            respostasTeoricas: progresso[id!].respostasTeoricas || [],
            uploads: progresso[id!].uploads || [],
          });
        }
      });

      setRespostas(lista);
    };

    carregarDados();
  }, [id]);

  if (!aula) return <div className="p-6">Carregando aula...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">
        Correção — Aula {aula.numero}: {aula.titulo}
      </h1>

      {respostas.length === 0 && (
        <p className="text-gray-500">Nenhum aluno concluiu esta aula ainda.</p>
      )}

      {respostas.map((aluno, index) => (
        <div
          key={index}
          className="border border-gray-300 bg-white rounded-lg shadow p-6 space-y-4"
        >
          {/* Dados do aluno */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <p className="text-lg font-bold">{aluno.nome}</p>
              <p className="text-sm text-gray-600">{aluno.email}</p>
              <p className="text-xs text-gray-400 mt-1">UID: {aluno.uid}</p>
            </div>
          </div>

          {/* Respostas Teóricas */}
          <div>
            <h3 className="text-md font-semibold mb-2">🧠 Respostas Teóricas</h3>
            {aula.exerciciosTeoricos.map((pergunta, i) => (
              <div key={i} className="mb-3">
                <p className="font-medium text-sm">{i + 1}. {pergunta}</p>
                <div className="bg-gray-100 p-2 rounded text-sm whitespace-pre-line">
                  {aluno.respostasTeoricas[i] || <span className="text-gray-400">Sem resposta</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Arquivos Práticos
          <div>
            <h3 className="text-md font-semibold mb-2">📎 Arquivos Práticos</h3>
            {aula.exerciciosPraticos.map((descricao, i) => (
              <div key={i} className="mb-2">
                <p className="text-sm">{i + 1}. {descricao}</p>
                {aluno.uploads[i] ? (
                  <a
                    href={aluno.uploads[i]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Ver arquivo enviado
                  </a>
                ) : (
                  <p className="text-red-500 text-sm">Arquivo não enviado</p>
                )}
              </div>
            ))}
          </div> */}
          {/* Arquivos Práticos */}
          <div>
            <h3 className="text-md font-semibold mb-2">📎 Arquivos Práticos</h3>
            {aula.exerciciosPraticos.map((descricao, i) => (
              <div key={i} className="mb-4 p-3 border rounded bg-white">
                <div
                  className="text-sm prose max-w-none mb-1"
                  dangerouslySetInnerHTML={{ __html: `${i + 1}. ${descricao}` }}
                />
                {aluno.uploads[i] ? (
                  <a
                    href={aluno.uploads[i]!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    Ver arquivo enviado
                  </a>
                ) : (
                  <p className="text-red-500 text-sm">Arquivo não enviado</p>
                )}
              </div>
            ))}
          </div>

        </div>
      ))}
    </div>
  );
};

export default AdminAulaCorrecao;
