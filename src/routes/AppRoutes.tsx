import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Aula from "@/pages/Aula";
import AdminAulaCorrecao from "@/pages//admin/AdminAulaCorrecao";
import RegisterProfessor from "@/pages/RegisterProfessor";
import ProfDashboard from '@/pages/ProfDashboard';
import AdminAlunos from "@/pages/admin/AdminAlunos";
import CadastrarAula from "@/pages/CadastrarAula";
import AdminAulas from "@/pages/admin/AdminAulas";
import AdminAulaForm from "@/pages/admin/AdminAulaForm";
import PainelPresencas from "@/pages/admin/PainelPresencas";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/prof-dashboard" element={<ProfDashboard />} />
      <Route path="/aula/:id" element={<Aula />} />
      <Route path="/admin/aulas/correcao/:id" element={<AdminAulaCorrecao />} />
      <Route path="/register-professor" element={<RegisterProfessor />} />
      <Route path="/admin/alunos" element={<AdminAlunos />} />
      <Route path="/admin/aulas/nova-aula" element={<CadastrarAula />} />
      <Route path="/admin/aulas" element={<AdminAulas />} />
      <Route path="/admin/aula/nova" element={<AdminAulaForm />} />
      <Route path="/admin/aula/:id" element={<AdminAulaForm />} />
      <Route path="/admin/presencas" element={<PainelPresencas />} />
    </Routes>
  </Router>
);

export default AppRoutes;
