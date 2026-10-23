import './Footer.scss';

const ARCHITECTURE_LINK = 'https://github.com/crltrbdev/carlotoribio-web#architecture';

function Footer(props) {
    return <>
        <div className={`footer-wrapper ${props.className}`}>
            <span className="built-with">
                Built with React, AWS Lambda response streaming and OpenAI. <a href={ARCHITECTURE_LINK} target="_blank" rel='noopener noreferrer'>How it works ↗</a>
            </span>
            <span className="copyright">© {new Date().getFullYear()} Carlo Toribio</span>
        </div>
    </>
}

export default Footer;
