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

type ExercicioTeorico =
  | { tipo: "texto"; enunciado: string }
  | { tipo: "multipla"; enunciado: string; alternativas: string[]; correta: number }
  | { tipo: "multipla-multipla"; enunciado: string; alternativas: string[]; corretas: number[] }
  | {
      tipo: "relacione";
      enunciado: string;
      colunaA: string[];
      colunaB: string[];
      correspondencias: number[]; // índice de colunaB para cada item de colunaA
    };

type AulaData = {
  numero: number;
  titulo: string;
  resumo: string;
  explicacao: string;
  exemplo: string;
  exerciciosTeoricos: ExercicioTeorico[];
  exerciciosPraticos: string[];
};

type RespostaTeorica = string | { respostas: string[] };

const Aula = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const uid = auth.currentUser?.uid;
  const { alunoNome } = location.state;
  const [carregandoModalCloudinary, setCarregandoModalCloudinary] = useState<boolean | null>(false);
  const [aula, setAula] = useState<AulaData | null>(null);
  const [respostasTeoricas, setRespostasTeoricas] = useState<RespostaTeorica[]>([]);
  const [uploadURLs, setUploadURLs] = useState<(string | null)[]>([]);
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
      if (aulaDoc.exists()) {
        const dados = aulaDoc.data() as AulaData;
        setAula(dados);
        setRespostasTeoricas(dados.exerciciosTeoricos.map((ex) => ex.tipo === "multipla-multipla" ? "[]" : ""));
        setUploadURLs(Array(dados.exerciciosPraticos.length).fill(null));
      }

      if (!uid) return;
      const progressoDoc = await getDoc(doc(db, "progresso", uid));
      const progresso = progressoDoc.exists() ? progressoDoc.data() : {};
      if (progresso?.[id!]) {
        setStatus(progresso[id!].status);
        setRespostasTeoricas(progresso[id!].respostasTeoricas || []);
        setUploadURLs(progresso[id!].uploads || []);
      }
    };

    carregarAula();
  }, [id, uid]);

  const abrirWidget = async (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    setCarregandoModalCloudinary(true);
    e.preventDefault();
    try {
      if (!window.cloudinary?.createUploadWidget) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => {
            alert("Erro ao carregar o widget do Cloudinary.");
            reject();
          };
          document.body.appendChild(script);
        });
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: false,
          resourceType: "auto",
          clientAllowedFormats: ["xlsx", "txt", "png", "jpeg", "jpg"],
          maxFileSize: 5 * 1024 * 1024,
          publicId: `aula-${id}-exercicio-${index + 1}-${uid?.slice(0, 6) || "anon"}`,
          tags: [`aula-${id}`, `aluno-${uid}`],
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Erro no upload:", error);
            alert("Erro ao enviar o arquivo.");
            return;
          }

          if (result?.event === "success") {
            const novas = [...uploadURLs];
            novas[index] = result.info.secure_url;
            setUploadURLs(novas);
            alert(`Arquivo ${index + 1} enviado com sucesso!`);
          }

          if (result?.event === "display-changed" || result?.event === "close") {
            setCarregandoModalCloudinary(false);
          }
        }
      );

      widget.open();
    } catch (error) {
      alert("Erro ao abrir o Uploader: " + error);
      setCarregandoModalCloudinary(false);
    }
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
    await registrarPresenca({
      alunoId: uid,
      nomeAluno: alunoNome,
      aulaId: id ? id : "",
      nomeAula: aula?.titulo || "",
      statusAula: "em andamento",
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
    await registrarPresenca({
      alunoId: uid,
      nomeAluno: alunoNome,
      aulaId: id ? id : "",
      nomeAula: aula?.titulo || "",
      statusAula: "concluída",
    });
    alert("Aula concluída com sucesso!");
    navigate("/dashboard");
  };

  if (!aula) return <div className="p-6">Carregando aula...</div>;

const podeConcluirAula = () => {
  const todasRespostas = respostasTeoricas.every((resposta, i) => {
    const exercicio = aula.exerciciosTeoricos[i];
    if (!exercicio) return false;

    if (exercicio.tipo === "texto") {
      return typeof resposta === "string" && resposta.trim() !== "";
    }

    if (exercicio.tipo === "multipla") {
      return typeof resposta === "string" && resposta !== "";
    }

    if (exercicio.tipo === "multipla-multipla") {
      if (typeof resposta !== "string") return false;
      try {
        const arr = JSON.parse(resposta);
        return Array.isArray(arr) && arr.length > 0;
      } catch {
        return false;
      }
    }

    if (exercicio.tipo === "relacione") {
      if (typeof resposta !== "object" || !resposta?.respostas) return false;
      return resposta.respostas.every((r: string) => r.trim() !== "");
    }

    return false;
  });

  const todosUploads = uploadURLs.every((url) => url !== null);
  return todasRespostas && todosUploads;
};



  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-100">
      {carregandoModalCloudinary && (
        <div className="fixed inset-0 bg-black bg-opacity-60 text-white text-xl flex items-center justify-center z-[9999]">
          <p>⏳ Abrindo Uploader... Aguarde!</p>
        </div>
      )}

      <h1 className="text-2xl font-bold">{aula.titulo}</h1>
      <p className="text-sm text-gray-600">Status: {status === "nao_iniciada" ? "Não iniciada" : status === "em_andamento" ? "Em andamento" : "Concluída"}</p>

      <p><strong>Objetivo da aula:</strong> {aula.resumo}</p>

      <div>
        <h2 className="text-xl font-semibold mt-4 mb-2">O que vamos estudar:</h2>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: aula.explicacao }} />
      </div>

      {aula.exemplo.length > 10 && (
        <div>
          <h2 className="text-xl font-semibold mt-4 mb-2">Exemplos:</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: aula.exemplo }} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercícios Teóricos</h2>
        {aula.exerciciosTeoricos.map((ex, i) => (
          <div key={i} className="p-4 border rounded bg-white space-y-2">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: ex.enunciado }} />
            {ex.tipo === "texto" ? (
              <textarea className="w-full p-2 border rounded" value={typeof respostasTeoricas[i] === "string" ? respostasTeoricas[i] : ""} onChange={(e) => {
                const novas = [...respostasTeoricas];
                novas[i] = e.target.value;
                setRespostasTeoricas(novas);
              }} />
            ) : ex.tipo === "multipla" ? (
              <div className="space-y-2">
                {ex.alternativas.map((alt, j) => (
                  <label key={j} className="block">
                    <input type="radio" name={`pergunta-${i}`} checked={respostasTeoricas[i] === String(j)} onChange={() => {
                      const novas = [...respostasTeoricas];
                      novas[i] = String(j);
                      setRespostasTeoricas(novas);
                    }} className="mr-2" />
                    {alt}
                  </label>
                ))}
              </div>
            ) : ex.tipo === "multipla-multipla" ? (
              <div className="space-y-2">
                {ex.alternativas.map((alt, j) => {
                  const selecionadas: string[] = (() => {
                    const raw = respostasTeoricas[i];
                    if (typeof raw !== "string") return [];
                    try {
                      const parsed = JSON.parse(raw);
                      return Array.isArray(parsed) ? parsed.map(String) : [];
                    } catch {
                      return [];
                    }
                  })();

                  return (
                    <label key={j} className="block">
                      <input type="checkbox" checked={selecionadas.includes(String(j))} onChange={(e) => {
                        const novas = [...respostasTeoricas];
                        let atualizadas = [...selecionadas];
                        if (e.target.checked) {
                          atualizadas.push(String(j));
                        } else {
                          atualizadas = atualizadas.filter((alt) => alt !== String(j));
                        }
                        novas[i] = JSON.stringify(atualizadas);
                        setRespostasTeoricas(novas);
                      }} className="mr-2" />
                      {alt}
                    </label>
                  );
                })}
              </div>
            ) : ex.tipo === "relacione" ? (
              <div className="mt-3 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Coluna A</h4>
                    {ex.colunaA.map((item, j) => (
                      <p key={j} className="mb-2">{`${j + 1}. ${item}`}</p>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold">Coluna B</h4>
                    {ex.colunaB.map((item, j) => (
                      <div key={j} className="mb-2">
                        <textarea
                          value={`( ${(respostasTeoricas[i] as unknown as { respostas: string[] })?.respostas?.[j] || ""} ) ${item}`}
                          onChange={(e) => {
                            const match = e.target.value.match(/^\(\s*(\d*)\s*\)/);
                            const numero = match ? match[1] : "";
                            const novas = [...respostasTeoricas];
                            const respostas = [...((novas[i] as unknown as { respostas: string[] })?.respostas || ["", "", ""])];
                            respostas[j] = numero;
                            novas[i] = { respostas };
                            setRespostasTeoricas(novas);
                          }}
                          rows={2}
                          className="w-full p-2 border rounded resize-y"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ))}
        <button onClick={salvarProgresso} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Salvar Progresso</button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Exercícios Práticos</h2>
        {aula.exerciciosPraticos.map((descricao, i) => (
          <div key={i} className="p-4 border rounded bg-white space-y-2">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: descricao }} />
            <button onClick={(e) => abrirWidget(i, e)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Enviar Arquivo</button>
            {uploadURLs[i] && <p className="text-sm text-green-600">Arquivo enviado: <a href={uploadURLs[i]!} target="_blank" className="underline">ver arquivo</a></p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 mt-6">
        <div className="flex gap-4">
          <button onClick={salvarProgresso} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">Salvar Progresso</button>
          <button onClick={concluirAula} disabled={!podeConcluirAula()} className={`px-4 py-2 rounded text-white ${podeConcluirAula() ? "bg-green-600 hover:bg-green-700" : "bg-green-300 cursor-not-allowed"}`}>Concluir Aula</button>
          <button onClick={() => navigate("/dashboard")} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Voltar</button>
        </div>
        {!podeConcluirAula() && <p className="text-red-600 text-sm">Para concluir a aula, responda todos os exercícios teóricos e envie todos os arquivos práticos.</p>}
      </div>
    </div>
  );
};

export default Aula;
