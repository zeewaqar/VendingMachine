import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Registration from './components/Registration/Registration';
import ProductList from './components/ProductList/ProductList';
import DepositCoin from './components/Deposit/Deposit';
import AddProduct from './components/AddProduct/AddProduct';
import NotFound from './components//NotFound/NotFound';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AuthProvider from './context/AuthProvider';
import AuthContext from './context/authContext';

const theme = createTheme({});

function ProtectedWrapper({ children }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  return children;
}
function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/products" element={<ProtectedWrapper><ProductList /></ProtectedWrapper>} />
            <Route path="/deposit" element={<ProtectedWrapper><DepositCoin /></ProtectedWrapper>} />
            <Route path="/add-product" element={<ProtectedWrapper><AddProduct /></ProtectedWrapper>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
