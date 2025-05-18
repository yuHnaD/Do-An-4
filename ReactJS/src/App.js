import './App.css';
import Menu from './components/header/Menu.js';
import { Outlet } from 'react-router-dom';
import Footer from './components/home/Footer.js';
import { CartProvider } from './components/CartContext.js'; // Import CartProvider
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"></link>

function App() {
  return (
    <CartProvider> {/* Bao quanh toàn bộ ứng dụng với CartProvider */}
      <div className="App">
        <div className="App-header">
          <Menu />
        </div>
        <div className="App-outlet">
          <Outlet /> {/* Đây là nơi các route con sẽ được render */}
        </div>
        <div className="App-footer">
          <Footer />
        </div>
      </div>
    </CartProvider>
  );
}

export default App;
