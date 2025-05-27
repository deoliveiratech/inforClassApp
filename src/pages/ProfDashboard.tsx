import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

type Aula = {
  id: string;
  numero: number;
  titulo: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState<Aula[]>([]);

  useEffect(() => {
    const buscarAulas = async () => {
      const snap = await getDocs(collection(db, "aulas"));
      const lista = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Aula[];
      setAulas(lista.sort((a, b) => a.numero - b.numero));
    };

    buscarAulas();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold mb-6">Painel do Professor</h1>
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
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/aulas")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Gerenciar Aulas
          </button>

          <button
            onClick={() => navigate("/admin/alunos")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Ver progresso dos alunos
          </button>

          <button
            onClick={() => navigate("/admin/presencas")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Presença Alunos
          </button>
      </div>
          

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aulas.map((aula) => (
          <div
            key={aula.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/admin/aulas/correcao/${aula.id}`)}
          >
            <h3 className="text-lg font-semibold">Aula {aula.numero}</h3>
            <p className="text-sm text-gray-600">{aula.titulo}</p>
            <p className="text-sm text-blue-600 mt-2 underline">
              Ver correções dos alunos
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
