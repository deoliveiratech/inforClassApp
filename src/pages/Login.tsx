import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logoJumper from '@/assets/logo_jumper.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("aluno");
  const [erro, setErro] = useState("");
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cred = await signInWithEmailAndPassword(auth, email, senha);
      const uid = cred.user.uid;

      const colecao = perfil === "aluno" ? "alunos" : "professores";
      const userDoc = await getDoc(doc(db, colecao, uid));

      if (!userDoc.exists()) {
        setErro(`Usuário não encontrado como ${perfil}.`);
        return;
      }

      const cursoSelecionado = cursos.find(curso => curso.id === cursoId);
      const nomeCurso = cursoSelecionado ? cursoSelecionado.nome : ''; 

      navigate(perfil === "aluno" ? "/dashboard" : "/admin/prof-dashboard", { state: {cursoId, nomeCurso, perfil}});
    } catch (err: any) {
      setErro("Email ou senha inválidos.");
      console.error(err.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-500">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow w-full max-w-sm bg-gray-200">
        <img src={logoJumper} />
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        {erro && <p className="text-red-500 text-sm mb-3">{erro}</p>}

        <select
          value={perfil}
          onChange={(e) => setPerfil(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="aluno">Aluno</option>
          <option value="professor">Professor</option>
        </select>

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
          {/* <option value="">Selecione um curso</option> */}
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nome}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>

        <p className="mt-4 text-center text-sm">
          Não tem conta?{" "}
          <a href="/register" className="text-blue-600 hover:underline">Cria conta de Aluno</a>{" "}
          {/* |{" "} */}
          {/* <a href="/register-professor" className="text-purple-600 hover:underline">Professor</a> */}
        </p>
      </form>
    </div>
  );
};

export default Login;
