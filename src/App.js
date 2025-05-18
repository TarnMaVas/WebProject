import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Main from "./components/Main";
import Profile from "./components/Profile";
import Snippets from "./components/Snippets";
import Popular from "./components/Popular";
import Favorites from "./components/Favorites";
import { ToastProvider } from "./components/ToastProvider";
import { DialogProvider } from "./components/DialogProvider";

const App = () => {
  return (
    <ToastProvider>
      <DialogProvider>
        <Router>
          <Header />      
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/popular" element={<Popular />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/snippets" element={<Snippets />} />
          </Routes>
        </Router>
      </DialogProvider>
    </ToastProvider>
  );
};

export default App;
