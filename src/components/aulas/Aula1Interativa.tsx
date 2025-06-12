import React, { useState } from "react";

type Question = {
  id: string;
  question: string;
  placeholder: string;
};

const questions: Question[] = [
  {
    id: "q1",
    question: "O que é um sistema operacional?",
    placeholder: "Digite sua resposta aqui...",
  },
  {
    id: "q2",
    question: "Quais são três versões do Windows que você conhece?",
    placeholder: "Digite as versões aqui...",
  },
  {
    id: "q3",
    question: "Para que serve o Windows To Go?",
    placeholder: "Descreva com suas palavras...",
  },
  {
    id: "q4",
    question: "Qual a diferença entre os botões do mouse?",
    placeholder: "Explique como cada botão é utilizado...",
  },
];

const Aula1Interativa: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers({ ...answers, [id]: value });
  };

  const slides = [
    {
      title: "O que é o Sistema Operacional?",
      content: (
        <>
          <p>
            O sistema operacional é responsável por gerenciar a máquina e seus periféricos.
            Ele permite que o computador funcione e execute programas.
          </p>
          <p>
            O Windows é um dos sistemas operacionais mais populares, criado pela Microsoft.
            Possui diversas versões e é amplamente utilizado no mundo todo.
          </p>
        </>
      ),
    },
    {
      title: "Versões do Windows",
      content: (
        <>
          <p>Algumas versões históricas do Windows incluem:</p>
          <ul className="list-disc pl-6">
            <li>Windows 95, 98, 2000, ME, XP, Vista</li>
            <li>Windows 7, 8, 8.1, 10</li>
          </ul>
          <p>
            O Windows 10 trouxe melhorias no design, desempenho e compatibilidade com
            dispositivos touchscreen.
          </p>
        </>
      ),
    },
    {
      title: "Periféricos",
      content: (
        <>
          <p>Periféricos são dispositivos conectados ao computador:</p>
          <ul className="list-disc pl-6">
            <li>Entrada: teclado, mouse, scanner</li>
            <li>Saída: monitor, impressora</li>
            <li>Armazenamento: HD, CD/DVD, pen drives</li>
          </ul>
        </>
      ),
    },
    {
      title: "Iniciando e Encerrando o Windows 10",
      content: (
        <>
          <p>
            Para ligar o computador: verifique a tomada, pressione o botão de ligar e
            aguarde o sistema iniciar.
          </p>
          <p>
            Para desligar: use o Menu Iniciar &rarr; botão de energia &rarr; “Desligar”,
            “Suspender” ou “Reiniciar”.
          </p>
        </>
      ),
    },
    {
      title: "Windows To Go",
      content: (
        <p>
          Um recurso disponível nas versões Enterprise e Education do Windows 10 que
          permite inicializar o sistema por um pen drive, ideal para empresas.
        </p>
      ),
    },
    {
      title: "Uso do Teclado",
      content: (
        <ul className="list-disc pl-6">
          <li>Caps Lock ativa letras maiúsculas</li>
          <li>Backspace apaga, Enter muda de linha</li>
          <li>Acentos: á (´), ã (~), à (`), ê (^)</li>
        </ul>
      ),
    },
    {
      title: "Uso do Mouse",
      content: (
        <ul className="list-disc pl-6">
          <li>Botão esquerdo: selecionar, abrir</li>
          <li>Botão direito: menu de contexto</li>
          <li>Roda: rolagem e botão central</li>
          <li>Arrastar: clicar e mover</li>
        </ul>
      ),
    },
    {
      title: "Atividades de Fixação",
      content: (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q.id}>
              <p className="font-semibold">{q.question}</p>
              <textarea
                value={answers[q.id] || ""}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                placeholder={q.placeholder}
                className="w-full border rounded-md p-2 mt-1"
                rows={3}
              />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-xl font-bold">{slides[step].title}</h2>
        <div className="text-gray-700 space-y-2">{slides[step].content}</div>

        <div className="flex justify-between mt-6">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={handleNext}
            disabled={step === slides.length - 1}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Aula1Interativa;
