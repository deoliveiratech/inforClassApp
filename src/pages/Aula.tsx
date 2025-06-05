import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db, auth } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { registrarPresenca } from "@/lib/utils";

declare global {
  interface Window {
    cloudinary: any;
  }
}

type AulaData = {
  numero: number;
  titulo: string;
  resumo: string;
  explicacao: string;
  exemplo: string;
  exerciciosTeoricos: string[];
  exerciciosPraticos: string[];
};

const Aula = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const uid = auth.currentUser?.uid;
  const { alunoNome } = location.state;

  const [aula, setAula] = useState<AulaData | null>(null);
  const [respostasTeoricas, setRespostasTeoricas] = useState<string[]>(Array(5).fill(""));
  const [uploadURLs, setUploadURLs] = useState<(string | null)[]>(Array(5).fill(null));
  const [status, setStatus] = useState<"nao_iniciada" | "em_andamento" | "concluida">("nao_iniciada");

  const cloudName = "dva6np0fd";
  const uploadPreset = "exercicios-excel";

  useEffect(() => {

     if (!auth.currentUser) {
    navigate("/");
    return;
    }

    const carregarAula = async () => {
      const aulaDoc = await getDoc(doc(db, "aulas", id!));
      if (aulaDoc.exists()) setAula(aulaDoc.data() as AulaData);


      if(!uid) return;
      const progressoDoc = await getDoc(doc(db, "progresso", uid));
      const progresso = progressoDoc.exists() ? progressoDoc.data() : {};
      if (progresso?.[id!]) {
        setStatus(progresso[id!].status);
        setRespostasTeoricas(progresso[id!].respostasTeoricas || Array(5).fill(""));
        setUploadURLs(progresso[id!].uploads || Array(5).fill(null));
      }
    };

    carregarAula();
    
  }, [id, uid]);

  const abrirWidget = (index: number) => {
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url"],
        multiple: false,
        resourceType: "auto",
        clientAllowedFormats: ["xlsx"],
        maxFileSize: 5000000,
      },
      (error: any, result: any) => {
        if (!error && result.event === "success") {
          const novas = [...uploadURLs];
          novas[index] = result.info.secure_url;
          setUploadURLs(novas);
          alert(`Arquivo ${index + 1} enviado com sucesso!`);
        }
      }
    );
    widget.open();
  };

  const salvarProgresso = async () => {
    if (!uid) return;
    await setDoc(
      doc(db, "progresso", uid),
      {
        [id!]: {
          status: "em_andamento",
          respostasTeoricas,
          uploads: uploadURLs,
        },
      },
      { merge: true }
    );
    //Registrar presença do aluno
    await registrarPresenca({
    alunoId: uid,
    nomeAluno: alunoNome,
    aulaId: id ? id : "",
    nomeAula: aula?.titulo || "",
    statusAula: "em andamento", // ou "em andamento"
  });
    alert("Progresso salvo!");
  };

  const concluirAula = async () => {
    if (!uid) return;
    await setDoc(
      doc(db, "progresso", uid),
      {
        [id!]: {
          status: "concluida",
          respostasTeoricas,
          uploads: uploadURLs,
        },
      },
      { merge: true }
    );
    //Registrar presença do aluno
    await registrarPresenca({
      alunoId: uid,
      nomeAluno: alunoNome,
      aulaId: id ? id : "",
      nomeAula: aula?.titulo || "",
      statusAula: "concluída", // ou "em andamento"
    });

    alert("Aula concluída com sucesso!");
    navigate("/dashboard");
  };

  if (!aula) return <div className="p-6">Carregando aula...</div>;

  const podeConcluirAula = () => {
  const todasRespostas = respostasTeoricas.every((resposta) => resposta.trim() !== "");
  const todosUploads = uploadURLs.every((url) => url !== null);
  return todasRespostas && todosUploads;
};

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-100">
      <h1 className="text-2xl font-bold">{aula.titulo}</h1>
      <p className="text-sm text-gray-600">
        Status:{" "}
        {status === "nao_iniciada"
          ? "Não iniciada"
          : status === "em_andamento"
          ? "Em andamento"
          : "Concluída"}
      </p>
          
      <p><strong>Objetivo da aula:</strong> {aula.resumo}</p>

      <div>
        <h2 className="text-xl font-semibold mt-4 mb-2">O que vamos estudar:</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: aula.explicacao }}
        />
      </div>

      {aula.exemplo.length > 0 && (
        <div>
        <h2 className="text-xl font-semibold mt-4 mb-2">Exemplos:</h2>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: aula.exemplo }}
        />
      </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercícios Teóricos</h2>
        {aula.exerciciosTeoricos.map((pergunta, i) => (
          <div key={i}>
            <label className="block mb-1 font-medium">{pergunta}</label>
            <textarea
              className="w-full p-2 border rounded"
              value={respostasTeoricas[i]}
              onChange={(e) => {
                const novas = [...respostasTeoricas];
                novas[i] = e.target.value;
                setRespostasTeoricas(novas);
              }}
              required
            />
          </div>
        ))}
      </div>

      {/* <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercícios Práticos</h2>
        {aula.exerciciosPraticos.map((descricao, i) => (
          <div key={i}>
            <p className="mb-1 font-medium">{descricao}</p>
            <button
              onClick={() => abrirWidget(i)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enviar Arquivo
            </button>
            {uploadURLs[i] && (
              <p className="text-sm text-green-600">
                Arquivo enviado:{" "}
                <a href={uploadURLs[i]!} target="_blank" className="underline">
                  ver arquivo
                </a>
              </p>
            )}
          </div>
        ))}
      </div> */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercícios Práticos</h2>
        {aula.exerciciosPraticos.map((descricao, i) => (
          <div key={i} className="p-4 border rounded bg-white space-y-2">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: descricao }}
            />
            <button
              onClick={() => abrirWidget(i)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enviar Arquivo
            </button>
            {uploadURLs[i] && (
              <p className="text-sm text-green-600">
                Arquivo enviado:{" "}
                <a href={uploadURLs[i]!} target="_blank" className="underline">
                  ver arquivo
                </a>
              </p>
            )}
          </div>
        ))}
      </div>

      {/* <div className="flex gap-4 mt-6">
        <button
          onClick={salvarProgresso}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Salvar Progresso
        </button>
        <button
          onClick={concluirAula}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Concluir Aula
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div> */}
      <div className="flex flex-col gap-2 mt-6">
      <div className="flex gap-4">
        <button
          onClick={salvarProgresso}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
        >
          Salvar Progresso
        </button>

        <button
          onClick={concluirAula}
          disabled={!podeConcluirAula()}
          className={`px-4 py-2 rounded text-white ${
            podeConcluirAula()
              ? "bg-green-600 hover:bg-green-700"
              : "bg-green-300 cursor-not-allowed"
          }`}
        >
          Concluir Aula
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>

      {!podeConcluirAula() && (
        <p className="text-red-600 text-sm">
          Para concluir a aula, responda todos os exercícios teóricos e envie todos os arquivos práticos.
        </p>
      )}
    </div>

    </div>
  );
};

export default Aula;
