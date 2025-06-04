import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

import '@/styles/tiptap.css'; // Crie um CSS para estilizar

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}>Negrito</button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}>Itálico</button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}>Sublinhado</button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}>Riscado</button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'active' : ''}>Lista</button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'active' : ''}>Lista ordenada</button>
      <button onClick={() => editor.chain().focus().setParagraph().run()}>Parágrafo</button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Título</button>
      <button onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>Limpar</button>
    </div>
  );
};

const AdminAulaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [numero, setNumero] = useState(1);
  const [titulo, setTitulo] = useState("");
  const [resumo, setResumo] = useState("");
  const [explicacao, setExplicacao] = useState("");
  const [exemplo, setExemplo] = useState("");
  const [exerciciosTeoricos, setExerciciosTeoricos] = useState<string[]>(["", "", "", "", ""]);
  const [exerciciosPraticos, setExerciciosPraticos] = useState<string[]>(["", "", "", "", ""]);

  const editorExplicacao = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: explicacao,
    onUpdate({ editor }) {
      setExplicacao(editor.getHTML());
    },
  });

  const editorExemplo = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: exemplo,
    onUpdate({ editor }) {
      setExemplo(editor.getHTML());
    },
  });

  useEffect(() => {
    if (id) {
      const carregarAula = async () => {
        const snap = await getDoc(doc(db, "aulas", id));
        if (snap.exists()) {
          const dados = snap.data();
          setNumero(dados.numero || 1);
          setTitulo(dados.titulo || "");
          setResumo(dados.resumo || "");
          setExplicacao(dados.explicacao || "");
          setExemplo(dados.exemplo || "");
          setExerciciosTeoricos(dados.exerciciosTeoricos || ["", "", "", "", ""]);
          setExerciciosPraticos(dados.exerciciosPraticos || ["", "", "", "", ""]);

          editorExplicacao?.commands.setContent(dados.explicacao || "");
          editorExemplo?.commands.setContent(dados.exemplo || "");
        }
      };
      carregarAula();
    } else {
      const calcularProximoNumero = async () => {
        const snap = await getDocs(collection(db, "aulas"));
        const numeros = snap.docs.map((doc) => doc.data().numero).filter((n) => typeof n === "number");
        const maxNumero = numeros.length > 0 ? Math.max(...numeros) : 0;
        setNumero(maxNumero + 1);
      };
      calcularProximoNumero();
    }
  }, [id, editorExplicacao, editorExemplo]);

  const gerarIdPadrao = (numero: number) => {
    return `aula-${numero.toString().padStart(2, "0")}`;
  };

  const salvar = async () => {
    const dados = {
      numero,
      titulo,
      resumo,
      explicacao,
      exemplo,
      exerciciosTeoricos,
      exerciciosPraticos,
    };

    const docId = id ? id : gerarIdPadrao(numero);

    if (!id) {
      const docRef = doc(db, "aulas", docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        alert(`Já existe uma aula com o número ${numero} (ID: ${docId}). Escolha outro número.`);
        return;
      }
    }

    await setDoc(doc(db, "aulas", docId), dados);
    alert("Aula salva com sucesso!");
    navigate("/admin/aulas");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">
        {id ? `Editar Aula ${numero}` : `Nova Aula ${numero}`}
      </h1>

      <label className="block">
        <span className="font-medium">Número</span>
        <input
          type="number"
          value={numero}
          onChange={(e) => setNumero(Number(e.target.value))}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span className="font-medium">Título</span>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </label>

      <label className="block">
        <span className="font-medium">Objetivo da Aula</span>
        <textarea
          value={resumo}
          onChange={(e) => setResumo(e.target.value)}
          className="w-full p-2 border rounded"
          style={{ height: "200px" }}
        />
      </label>

      <label className="block">
        <span className="font-medium">O que vamos estudar</span>
        <MenuBar editor={editorExplicacao} />
        <EditorContent editor={editorExplicacao} className="border rounded p-3 bg-white" />
      </label>

      <label className="block">
        <span className="font-medium">Exemplo</span>
        <MenuBar editor={editorExemplo} />
        <EditorContent editor={editorExemplo} className="border rounded p-3 bg-white" />
      </label>

      <div>
        <h2 className="font-semibold">Exercícios Teóricos</h2>
        {exerciciosTeoricos.map((val, i) => (
          <input
            key={i}
            type="text"
            value={val}
            onChange={(e) => {
              const novaLista = [...exerciciosTeoricos];
              novaLista[i] = e.target.value;
              setExerciciosTeoricos(novaLista);
            }}
            className="w-full p-2 border rounded mb-2"
          />
        ))}
      </div>

      <div>
        <h2 className="font-semibold">Exercícios Práticos</h2>
        {exerciciosPraticos.map((val, i) => (
          <div key={i} className="mb-6 p-4 border rounded bg-white">
            <label className="block mb-1 font-medium">Enunciado {i + 1}</label>

            <div
              className="prose max-w-none bg-gray-50 p-3 rounded mb-3"
              dangerouslySetInnerHTML={{ __html: val }}
            />

            <textarea
              value={val}
              onChange={(e) => {
                const novaLista = [...exerciciosPraticos];
                novaLista[i] = e.target.value;
                setExerciciosPraticos(novaLista);
              }}
              className="w-full p-2 border rounded"
              style={{ height: "200px" }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={salvar}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Salvar Aula
      </button>
    </div>
  );
};

export default AdminAulaForm;
