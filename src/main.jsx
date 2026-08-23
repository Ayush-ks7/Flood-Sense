import { createRoot } from "react-dom/client";
import "./index.css";
import AppRoutes from "./Routes/AppRoutes.jsx";
import { DataProvider } from "./Context/AppContext.jsx";

createRoot(document.getElementById("root")).render(
  <DataProvider>
    <AppRoutes />
  </DataProvider>,
);
