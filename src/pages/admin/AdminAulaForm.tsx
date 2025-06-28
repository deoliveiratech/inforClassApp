import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import TipTapEditor from "@/components/TipTapEditor";

interface ExercicioTeorico {
  tipo: 'texto' | 'multipla' | 'multipla-multipla';
  enunciado: string;
  alternativas?: string[];
  correta?: number;
  corretas?: number[];
}

const AdminAulaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numero, setNumero] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [exemplo, setExemplo] = useState("");
  const [exerciciosTeoricos, setExerciciosTeoricos] = useState<ExercicioTeorico[]>([]);
  const [exerciciosPraticos, setExerciciosPraticos] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      const carregarAula = async () => {
        const snap = await getDoc(doc(db, "aulas", id));
        if (snap.exists()) {
          const dados = snap.data();
          setNumero(dados.numero || 1);
          setTitulo(dados.titulo || "");
          setResumo(dados.resumo || "");
          setExplicacao(dados.explicacao || "");
          setExemplo(dados.exemplo || "");
          setExerciciosPraticos(dados.exerciciosPraticos || []);

          const normalizarTeoricos = (dados.exerciciosTeoricos || []).map((item: any) =>
            typeof item === "string"
              ? { tipo: "texto", enunciado: item }
              : item
          );
          setExerciciosTeoricos(normalizarTeoricos);
        }
      };
      carregarAula();
    } else {
      const calcularProximoNumero = async () => {
        const snap = await getDocs(collection(db, "aulas"));
        const numeros = snap.docs
          .map((doc) => doc.data().numero)
          .filter((n) => typeof n === "number");
        const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
        setNumero(maxNumero + 1);
      };
      calcularProximoNumero();
    }
  }, [id]);

  const gerarIdPadrao = (numero: number) => {
    return `aula-${numero.toString().padStart(2, "0")}`;
  };

  const salvar = async () => {
    const dados = {
      numero,
      titulo,
      resumo,
      explicacao,
      exemplo,
      exerciciosTeoricos,
      exerciciosPraticos,
    };

    const docId = id ? id : gerarIdPadrao(numero);

    if (!id) {
      const docRef = doc(db, "aulas", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert(
          `Já existe uma aula com o número ${numero} (ID: ${docId}). Por favor, escolha outro número.`
        );
        return;
      }
    }

    await setDoc(doc(db, "aulas", docId), dados);

    alert("Aula salva com sucesso!");
    navigate("/admin/aulas");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        {id ? `Editar Aula ${numero}` : `Nova Aula ${numero}`}
      </h1>

      <label className="block">
        <span className="font-medium">Número</span>
        <input
          type="number"
          value={numero}
          onChange={(e) => setNumero(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span className="font-medium">Título</span>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span className="font-medium">Objetivo da Aula</span>
        <textarea
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          className="w-full p-2 border rounded"
          style={{ height: "200px" }}
        />
      </label>

      <label className="block">
        <span className="font-medium">O que vamos estudar</span>
        <TipTapEditor content={explicacao} onChange={setExplicacao} />
      </label>

      {exemplo.length > 0 && (
        <label className="block">
          <span className="font-medium">Exemplo</span>
          <TipTapEditor content={exemplo} onChange={setExemplo} />
        </label>
      )}

      <div>
        <h2 className="font-semibold">Exercícios Teóricos</h2>
        {exerciciosTeoricos.map((ex, i) => (
          <div key={i} className="mb-4 p-4 border rounded bg-white">
            <label className="block mb-1 font-medium">Exercício Teórico {i + 1}</label>
            <select
              value={ex.tipo}
              onChange={(e) => {
                const novaLista = [...exerciciosTeoricos];
                const tipo = e.target.value as ExercicioTeorico["tipo"];
                novaLista[i] = { tipo, enunciado: ex.enunciado };
                setExerciciosTeoricos(novaLista);
              }}
              className="mb-2 p-2 border rounded"
            >
              <option value="texto">Dissertativo</option>
              <option value="multipla">Múltipla Escolha (única)</option>
              <option value="multipla-multipla">Múltipla Escolha (várias)</option>
            </select>

            <div
              className="prose max-w-none bg-gray-50 p-3 rounded mb-3"
              dangerouslySetInnerHTML={{ __html: ex.enunciado }}
            />
            <TipTapEditor
              content={ex.enunciado}
              onChange={(value) => {
                const novaLista = [...exerciciosTeoricos];
                novaLista[i].enunciado = value;
                setExerciciosTeoricos(novaLista);
              }}
            />

            {(ex.tipo === 'multipla' || ex.tipo === 'multipla-multipla') && (
              <div className="mt-3 space-y-2">
                {(ex.alternativas || ["", "", "", ""]).map((alt, j) => (
                  <div key={j} className="flex gap-2 items-center">
                    <input
                      type={ex.tipo === 'multipla' ? 'radio' : 'checkbox'}
                      checked={
                        ex.tipo === 'multipla'
                          ? ex.correta === j
                          : ex.corretas?.includes(j) || false
                      }
                      onChange={() => {
                        const novaLista = [...exerciciosTeoricos];
                        if (ex.tipo === 'multipla') {
                          novaLista[i].correta = j;
                        } else {
                          const corretas = new Set(novaLista[i].corretas || []);
                          corretas.has(j) ? corretas.delete(j) : corretas.add(j);
                          novaLista[i].corretas = Array.from(corretas);
                        }
                        setExerciciosTeoricos(novaLista);
                      }}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border rounded"
                      value={alt}
                      onChange={(e) => {
                        const novaLista = [...exerciciosTeoricos];
                        const alternativas = [...(novaLista[i].alternativas || ["", "", "", ""])];
                        alternativas[j] = e.target.value;
                        novaLista[i].alternativas = alternativas;
                        setExerciciosTeoricos(novaLista);
                      }}
                    />
                    <button
                onClick={() => {
                  const novaLista = [...exerciciosTeoricos];
                  const alternativas = [...(novaLista[i].alternativas || [])];
                  alternativas.splice(j, 1);
                  novaLista[i].alternativas = alternativas;
                  setExerciciosTeoricos(novaLista);
                }}
                className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition text-sm"
              >
                Remover alternativa
              </button>
                  </div>
                ))}
                {/* ADICIONAR E REMOVER ALTERNATIVAS */}
            <button
                onClick={() => {
                  const novaLista = [...exerciciosTeoricos];
                  const alternativas = [...(novaLista[i].alternativas || [])];
                  alternativas.push("");
                  novaLista[i].alternativas = alternativas;
                  setExerciciosTeoricos(novaLista);
                }}
                className="text-blue-600 border border-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition text-sm"
              >
                ➕ Adicionar alternativa
              </button> <span></span>
               <span></span>
              
            {/* FIM */}
            <button
              onClick={() => {
                const novaLista = [...exerciciosTeoricos];
                novaLista.splice(i, 1);
                setExerciciosTeoricos(novaLista);
              }}
              className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-50 transition text-sm"
            >
              Remover Exercício
            </button>
          </div>
            )}
            
          </div>
        ))}
        <button
          onClick={() =>
            setExerciciosTeoricos([
              ...exerciciosTeoricos,
              { tipo: "texto", enunciado: "" }
            ])
          }
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Adicionar Exercício Teórico
        </button>
      </div>

      <div>
        <h2 className="font-semibold">Exercícios Práticos</h2>
        {exerciciosPraticos.map((val, i) => (
          <div key={i} className="mb-6 p-4 border rounded bg-white">
            <label className="block mb-1 font-medium">Exercício Prático {i + 1} (PREVIEW)</label>
            <div
              className="prose max-w-none bg-gray-50 p-3 rounded mb-3"
              dangerouslySetInnerHTML={{ __html: val }}
            />
            <TipTapEditor
              content={val}
              onChange={(value) => {
                const novaLista = [...exerciciosPraticos];
                novaLista[i] = value;
                setExerciciosPraticos(novaLista);
              }}
            />
            <button
              onClick={() => {
                const novaLista = [...exerciciosPraticos];
                novaLista.splice(i, 1);
                setExerciciosPraticos(novaLista);
              }}
              className="mt-2 text-red-600 hover:underline"
            >
              Remover Exercício
            </button>
          </div>
        ))}
        <button
          onClick={() => setExerciciosPraticos([...exerciciosPraticos, ""])}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Adicionar Exercício Prático
        </button>
      </div>

      <button
        onClick={salvar}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Salvar Aula
      </button>
    </div>
  );
};

export default AdminAulaForm;
