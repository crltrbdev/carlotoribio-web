import { FaAws } from 'react-icons/fa';

import './Footer.scss';

export const ARCHITECTURE_LINK = 'https://github.com/crltrbdev/carlotoribio-web#architecture';

function Footer(props) {
    return <>
        <div className={`footer-wrapper ${props.className}`}>
            <span className="copyright">© {new Date().getFullYear()} Carlo Toribio</span>
            <span className="separator" aria-hidden="true">·</span>
            <a href={ARCHITECTURE_LINK} target="_blank" rel='noopener noreferrer'>How it works ↗</a>
            <span className="separator" aria-hidden="true">·</span>
            <span className="powered-by">
                Powered by
                <FaAws className="aws-icon" role="img" aria-label="AWS" />
            </span>
        </div>
    </>
}

export default Footer;
