const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Inicializa o Firebase
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

/**
 * Exporta uma coleção inteira do Firestore para um arquivo JSON.
 * @param {string} collectionName - Nome da coleção.
 * @param {string} outputFilePath - Caminho do arquivo JSON de saída.
 */
async function exportCollectionToJSON(collectionName, outputFilePath) {
  try {
    const snapshot = await db.collection(collectionName).get();

    if (snapshot.empty) {
      console.log(`A coleção ${collectionName} está vazia.`);
      return;
    }

    const data = {};
    snapshot.forEach(doc => {
      data[doc.id] = doc.data();
    });

    fs.writeFileSync(outputFilePath, JSON.stringify(data, null, 2));
    console.log(`Coleção ${collectionName} exportada com sucesso para ${outputFilePath}`);
  } catch (error) {
    console.error("Erro ao exportar coleção:", error);
  }
}

// 🔥 Exemplo de uso:
// exportCollectionToJSON(
//   "aulas",                                  // Nome da coleção
//   path.join(__dirname, "aulas.json")        // Caminho do arquivo de saída
// );

return (
  <div>
    <button onClick={() => exportCollectionToJSON("aulas", path.join(__dirname, "aulas.json"))}>Exportar Aulas</button>
  </div>
)