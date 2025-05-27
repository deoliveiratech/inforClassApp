import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [cursos, setCursos] = useState<{ id: string; nome: string, ativo: boolean }[]>([]);

  interface Curso {
    id: string,
    nome: string,
    ativo: boolean
  }

  useEffect(() => {
    const buscarCursos = async () => {
      const snap = await getDocs(collection(db, "cursos"));
      const ativos = snap.docs
        .map((doc) => ({ id: doc.id,  ...doc.data() } as Curso))
        .filter((c) => c.ativo);
      setCursos(ativos);
    };

    buscarCursos();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cursoId) return alert("Selecione um curso");

    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    await setDoc(doc(db, "alunos", cred.user.uid), {
      uid: cred.user.uid,
      nome,
      email,
      cursoId,
      criadoEm: new Date(),
    });

    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Cadastro de Aluno</h2>

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        />

        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        >
          <option value="">Selecione um curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome}
            </option>
          ))}
        </select>

        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Cadastrar
        </button>
      </form>
    </div>
  );
};

export default Register;
