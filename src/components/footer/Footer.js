import './Footer.scss';

export const ARCHITECTURE_LINK = 'https://github.com/crltrbdev/carlotoribio-web#architecture';

function Footer(props) {
    return <>
        <div className={`footer-wrapper ${props.className}`}>
            <span className="built-with">
                <span className="mobile-hide">Built with React, AWS Lambda response streaming and OpenAI. </span>
                <a href={ARCHITECTURE_LINK} target="_blank" rel='noopener noreferrer'>How it works ↗</a>
            </span>
            <span className="copyright">© {new Date().getFullYear()} Carlo Toribio</span>
        </div>
    </>
}

export default Footer;
