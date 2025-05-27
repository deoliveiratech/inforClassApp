import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";

const PainelPresencas = () => {
    const navigate = useNavigate();
    const [presencas, setPresencas] = useState<any[]>([]);

  useEffect(() => {
    const fetchPresencas = async () => {
      const snap = await getDocs(collection(db, "presencas"));
      const dados = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPresencas(dados);
    };

    fetchPresencas();
  }, []);

  return (
    <div className="p-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold mb-4">Registros de Presença</h2>
            <button
                onClick={() => navigate("/admin/prof-dashboard")}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                Voltar
            </button>
        </div>
      
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2">Aluno</th>
            <th className="border px-2">Aula</th>
            <th className="border px-2">Status</th>
            <th className="border px-2">Data</th>
          </tr>
        </thead>
        <tbody>
          {presencas.map(p => (
            <tr key={p.id}>
              <td className="border px-2">{p.nomeAluno}</td>
              <td className="border px-2">{p.nomeAula}</td>
              <td className="border px-2">{p.statusAula}</td>
              <td className="border px-2">
                {new Date(p.dataHora.seconds * 1000).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PainelPresencas;
