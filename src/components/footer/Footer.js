import awsImg from '../../assets/poweredBy01.png';

import './Footer.scss';

function Footer(props) {
    return <>
        <div className={`footer-wrapper ${props.className}`}>
            <div className="copyright">
                <label>Copyright © {new Date().getFullYear()} Carlo Toribio</label>
            </div>
            <div className="poweredByContainer">
                <img alt="aws" className="poweredBy" src={awsImg} />
            </div>
        </div>
    </>
}

export default Footer;