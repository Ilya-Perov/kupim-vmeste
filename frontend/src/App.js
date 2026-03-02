import './App.css';
import Home from './components/home/home';
import Account from './components/account/account';
import { BrowserRouter as Router, Route, Routes } from 'react-router';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='account' element={<Account/>}/>
      </Routes>
    </Router>
  );
}

export default App;
