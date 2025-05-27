import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function ImportAulasButton() {
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const aulasCollection = collection(db, "aulas");

      const keys = Object.keys(json);

      for (const key of keys) {
        const data = json[key];
        await setDoc(doc(aulasCollection, key), data);
      }

      alert("Importação concluída com sucesso!");
    } catch (error) {
      console.error("Erro ao importar:", error);
      alert("Erro ao importar dados. Verifique se o arquivo JSON está correto.");
    }
  };

  const handleButtonClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = handleImport;
    input.click();
  };

  return (
    <Button onClick={handleButtonClick} className="bg-gray-600 text-white px-4 py-2 mb-6 rounded hover:bg-gray-700">
      <UploadCloud className="w-4 h-4" />
      Importar Aulas
    </Button>
  );
}
