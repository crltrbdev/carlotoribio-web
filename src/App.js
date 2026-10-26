import './App.scss';
import Home from './components/home/Home';
import Footer from './components/footer/Footer';
import Links from './components/links/Links';

// /links is the link-in-bio page behind the business card QR code
const isLinksPage = window.location.pathname.replace(/\/+$/, '') === '/links';

function App() {
    if (isLinksPage) {
        return (
            <section className="app-wrapper links-page">
                <Links />
            </section>
        );
    }

    return (
        <section className="app-wrapper">
            <Home className="home" />
            <Footer className="footer" />
        </section>
    );
}

export default App;
