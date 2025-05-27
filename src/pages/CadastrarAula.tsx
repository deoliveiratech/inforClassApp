import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const CadastrarAula = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [numero, setNumero] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [exemplo, setExemplo] = useState("");
  const [exTeoricos, setExTeoricos] = useState<string[]>(Array(5).fill(""));
  const [exPraticos, setExPraticos] = useState<string[]>(Array(5).fill(""));

  useEffect(() => {
    const carregarDados = async () => {
      if (id && id !== "nova-aula") {
        const docSnap = await getDoc(doc(db, "aulas", id));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNumero(data.numero);
          setTitulo(data.titulo);
          setResumo(data.resumo);
          setExplicacao(data.explicacao);
          setExemplo(data.exemplo);
          setExTeoricos(data.exerciciosTeoricos || Array(5).fill(""));
          setExPraticos(data.exerciciosPraticos || Array(5).fill(""));
        }
      }
    };
    carregarDados();
  }, [id]);

  const salvar = async () => {
    const aulaData = {
      numero,
      titulo,
      resumo,
      explicacao,
      exemplo,
      exerciciosTeoricos: exTeoricos,
      exerciciosPraticos: exPraticos,
    };

    const aulaRef = id && id !== "nova-aula" ? doc(db, "aulas", id) : doc(db, "aulas", `${Date.now()}`);
    await setDoc(aulaRef, aulaData);
    alert("Aula salva com sucesso!");
    navigate("/admin");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">{id === "nova-aula" ? "Cadastrar Aula" : "Editar Aula"}</h1>

      <input type="number" className="w-full p-2 border rounded" placeholder="Número da aula" value={numero} onChange={e => setNumero(+e.target.value)} />
      <input type="text" className="w-full p-2 border rounded" placeholder="Título da aula" value={titulo} onChange={e => setTitulo(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Resumo" value={resumo} onChange={e => setResumo(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Explicação" value={explicacao} onChange={e => setExplicacao(e.target.value)} />
      <textarea className="w-full p-2 border rounded" placeholder="Exemplo" value={exemplo} onChange={e => setExemplo(e.target.value)} />

      <div>
        <h2 className="font-semibold mt-4">Exercícios Teóricos</h2>
        {exTeoricos.map((texto, i) => (
          <textarea key={i} className="w-full p-2 border rounded mt-1" placeholder={`Pergunta ${i + 1}`} value={texto} onChange={e => {
            const novos = [...exTeoricos];
            novos[i] = e.target.value;
            setExTeoricos(novos);
          }} />
        ))}
      </div>

      <div>
        <h2 className="font-semibold mt-4">Exercícios Práticos</h2>
        {exPraticos.map((texto, i) => (
          <textarea key={i} className="w-full p-2 border rounded mt-1" placeholder={`Exercício ${i + 1}`} value={texto} onChange={e => {
            const novos = [...exPraticos];
            novos[i] = e.target.value;
            setExPraticos(novos);
          }} />
        ))}
      </div>

      <button onClick={salvar} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Salvar Aula
      </button>
    </div>
  );
};

export default CadastrarAula;
