import { Button } from "@/components/ui/button";
import { ArrowDownToLine } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { saveAs } from "file-saver";

export function ExportAulasButton() {
  const handleExport = async () => {
    try {
      const snap = await getDocs(collection(db, "aulas"));

      if (snap.empty) {
        alert("Nenhum dado encontrado na coleção 'aulas'.");
        return;
      }

      const data: Record<string, any> = {};
      snap.forEach(doc => {
        data[doc.id] = doc.data();
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json;charset=utf-8",
      });

      saveAs(blob, "aulas.json");
      alert("Exportação concluída com sucesso!");

    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      alert("Erro ao exportar dados. Verifique o console.");
    }
  };

  return (
    <Button onClick={handleExport} className="bg-gray-600 text-white px-4 py-2 mb-6 rounded hover:bg-gray-700">
      <ArrowDownToLine className="w-4 h-4" />
      Exportar Aulas
    </Button>
  );
}
