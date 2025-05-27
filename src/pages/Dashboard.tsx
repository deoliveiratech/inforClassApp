import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useNavigate} from "react-router-dom";

type Aula = {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
};

type Progresso = {
  [aulaId: string]: {
    status: "nao_iniciada" | "em_andamento" | "concluida";
  };
};

const Dashboard = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [progresso, setProgresso] = useState<Progresso>({});
  const [_uid, setUid] = useState<string | null>(null);
  const [alunoNome, setAlunoNome] = useState("");

  // const { nomeCurso } = location.state;
  
  useEffect(() => {
  if (!auth.currentUser) {
    navigate("/");
    return;
  }

  const uid = auth.currentUser.uid;
  setUid(uid);
  carregarDados(uid);
}, []);

  const carregarDados = async (uid: string) => {
    
  // Aulas
  
  const aulasSnap = await getDocs(collection(db, "aulas"));
  const aulasLista: Aula[] = aulasSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Aula[];

  // Progresso
  const progDoc = await getDoc(doc(db, "progresso", uid));
  const dadosProgresso: Progresso = progDoc.exists() ? progDoc.data() as Progresso : {};

  // Nome do aluno
  const alunoDoc = await getDoc(doc(db, "alunos", uid));
  if (alunoDoc.exists()) {
    const data = alunoDoc.data();
    setAlunoNome(data.nome || "");
  }

  setAulas(aulasLista.sort((a, b) => a.numero - b.numero));
  setProgresso(dadosProgresso);
};

  const contarStatus = (status: "concluida" | "em_andamento" | "nao_iniciada") =>
    aulas.filter((aula) => progresso[aula.id]?.status === status).length;

  const desbloqueada = (index: number) => {
    if (index === 0) return true;
    const aulaAnterior = aulas[index - 1];
    return progresso[aulaAnterior.id]?.status === "concluida";
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">
          Painel do Aluno: <span className="text-blue-600">{alunoNome}</span>
        </h1>
        <button
          onClick={() => {
            auth.signOut();
            navigate("/");
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
        >
          Sair
        </button>
      </div>


      {/* Cards de progresso */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card label="Total de Aulas" valor={aulas.length} />
        <Card label="Concluídas" valor={contarStatus("concluida")} />
        <Card label="Em Andamento" valor={contarStatus("em_andamento")} />
        <Card label="Restantes" valor={aulas.length - contarStatus("concluida")} />
      </div>

      {/* Cards de aulas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {aulas.map((aula, index) => {
          const status = progresso[aula.id]?.status || "nao_iniciada";
          const podeAcessar = desbloqueada(index);
          return (
            <div
              key={aula.id}
              className={`p-4 rounded shadow cursor-pointer transition ${
                podeAcessar
                  ? "bg-white hover:shadow-lg"
                  : "bg-gray-300 cursor-not-allowed opacity-50"
              }`}
              onClick={() => podeAcessar && navigate(`/aula/${aula.id}`, {state: {alunoNome}})}
            >
              <h3 className="font-bold text-lg mb-1">Aula {aula.numero}</h3>
              <p className="text-sm mb-2">{aula.titulo}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {status === "concluida"
                  ? "✅ Concluída"
                  : status === "em_andamento"
                  ? "🟡 Em andamento"
                  : "🔒 Não iniciada"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Card = ({ label, valor }: { label: string; valor: number }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-bold">{valor}</p>
  </div>
);

export default Dashboard;
