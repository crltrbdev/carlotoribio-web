import './App.scss';
import Home from './components/home/Home';
import Footer from './components/footer/Footer';

function App() {
    return (
        <section className="app-wrapper">
            <Home className="home" />
            <Footer className="footer" />
        </section>
    );
}

export default App;
