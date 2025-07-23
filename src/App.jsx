import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CoursesPage from "./pages/CoursesPage";
import CourseDetail from "./pages/CourseDetail";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateCourse from "./pages/admin/CreateCourse";
import EditCourse from "./pages/admin/EditCourse";
import ManageFormations from "./pages/admin/ManageFormations";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import RequireAuth from "./components/routes/RequireAuth/RequireAuth";
import "./assets/styles/variables.css";
import "./assets/styles/App.css";
import FormationDetails from "./pages/FormationDetails";
import MyCourses from "./pages/MyCourses";
import MyFormationDetail from "./pages/MyFormationDetail";
import FormationPage from "./pages/FormationPage";
import ScrollToTop from "./components/ScrollToTop/ScrollToTop";
import BioRocioGarrote from "./pages/BioRocioGarrote";
import Register from "./pages/Register";
import RegisterSuccess from "./pages/RegisterSuccess";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ManageCourses from "./pages/admin/ManageCourses";
import ManagePresentialFormations from "./pages/admin/ManagePresentialFormations";
import ManageDiscounts from "./pages/admin/ManageDiscounts";
import RequireAdmin from "./components/routes/RequireAdmin/RequireAdmin";
import CartPage from "./pages/CartPage";
import MyCourseDetail from "./pages/MyCourseDetail";
import PagoExitoso from "./pages/pago-exitoso";
import PagoEmbedPage from "./pages/PagoEmbedPage";
import SearchResults from "./pages/SearchResults";
import ComingSoonPage from "./pages/ComingSoonPage";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<CoursesPage />} />
          <Route path="/mis-cursos" element={<MyCourses />} />
          <Route
            path="/mis-cursos/formacion/:id"
            element={<MyFormationDetail />}
          />
          <Route path="/mis-cursos/curso/:id" element={<MyCourseDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registro-exitoso" element={<RegisterSuccess />} />
          <Route path="/olvidaste-tu-contraseña" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/formaciones" element={<FormationPage />} />
          <Route path="/biografia" element={<BioRocioGarrote />} />
          <Route path="/carrito" element={<CartPage />} />
          <Route path="/pago-exitoso" element={<PagoExitoso />} />

          <Route path="/pago-embed" element={<PagoEmbedPage />} />
          <Route path="/formaciones/:id/:slug" element={<FormationDetails />} />
          <Route path="/courses/:id/:slug" element={<CourseDetail />} />
          <Route path="/buscar" element={<SearchResults />} />
          <Route path="/mantenimiento" element={<ComingSoonPage />} />


          {/* 🔒 Rutas protegidas para admins */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/create" element={<CreateCourse />} />
            <Route path="/admin/edit/:id" element={<EditCourse />} />
            <Route
              path="/admin/formaciones-online"
              element={<ManageFormations />}
            />
            <Route path="/admin/cursos" element={<ManageCourses />} />
            <Route path="/admin/bonos" element={<ManageDiscounts />} />
            <Route
              path="/admin/formaciones-presenciales"
              element={<ManagePresentialFormations />}
            />
          </Route>
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
