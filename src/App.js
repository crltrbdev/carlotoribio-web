import './App.scss';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './components/home/Home';
import Blog from './components/blog/Blog';
import BlogPost from './components/blog-post/BlogPost';
import Footer from './components/footer/Footer';

function App() {
    return (
        <HashRouter>
            <section className="app-wrapper">
                <Routes>
                    <Route path="/" element={<Home className="home" />} />
                    <Route path="/blog" element={<Blog className="page" />} />
                    <Route path="/blog/:slug" element={<BlogPost className="page" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <Footer className="footer" />
            </section>
        </HashRouter>
    );
}

export default App;
