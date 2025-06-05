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

const AdminAulaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numero, setNumero] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [exemplo, setExemplo] = useState("");
  const [exerciciosTeoricos, setExerciciosTeoricos] = useState<string[]>([
    "", "", "", "", ""
  ]);
  const [exerciciosPraticos, setExerciciosPraticos] = useState<string[]>([
    "", "", "", "", ""
  ]);

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
          setExerciciosTeoricos(dados.exerciciosTeoricos || ["", "", "", "", ""]);
          setExerciciosPraticos(dados.exerciciosPraticos || ["", "", "", "", ""]);
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
        {/* <div className="mt-4 p-2 border border-gray-400">
        <h2 className="text-lg font-bold mb-2">Conteúdo HTML:</h2>
        <div>{explicacao}</div>
      </div> */}
      </label>
      
      {exemplo.length > 0 && (
        <label className="block">
        <span className="font-medium">Exemplo</span>
        <TipTapEditor content={exemplo} onChange={setExemplo} />
      </label>
      )}
      

      <div>
        <h2 className="font-semibold">Exercícios Teóricos</h2>
        {exerciciosTeoricos.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={(e) => {
              const novaLista = [...exerciciosTeoricos];
              novaLista[i] = e.target.value;
              setExerciciosTeoricos(novaLista);
            }}
            className="w-full p-2 border rounded mb-2"
          />
        ))}
      </div>

      <div>
        <h2 className="font-semibold">Exercícios Práticos</h2>
        {exerciciosPraticos.map((val, i) => (
          <div key={i} className="mb-6 p-4 border rounded bg-white">
            <label className="block mb-1 font-medium">Enunciado {i + 1}</label>

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
          </div>
        ))}
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
