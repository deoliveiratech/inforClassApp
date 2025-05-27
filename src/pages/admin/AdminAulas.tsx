import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { ExportAulasButton } from "@/components/ExportAulasButton";
import { ImportAulasButton } from "@/components/ImportAulasButton";

type Aula = {
  id: string;
  numero: number;
  titulo: string;
};

const AdminAulas = () => {
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
        <h1 className="text-3xl font-bold mb-6">Gerenciar Aulas</h1>
        <button
          onClick={() => navigate("/admin/prof-dashboard")}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Voltar
        </button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <button
        onClick={() => navigate("/admin/aula/nova")}
        className="bg-green-600 text-white px-4 py-2 mb-6 rounded hover:bg-green-700"
      >
        Nova Aula
      </button>

      <ExportAulasButton />
      <ImportAulasButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aulas.map((aula) => (
          <div
            key={aula.id}
            className="bg-white p-4 rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => navigate(`/admin/aula/${aula.id}`)}
          >
            <h3 className="text-lg font-semibold">Aula {aula.numero}</h3>
            <p className="text-sm text-gray-600">{aula.titulo}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAulas;
