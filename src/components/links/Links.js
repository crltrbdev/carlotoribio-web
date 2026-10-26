import React, { useEffect, useState } from 'react';
import { LuArrowRight, LuBot, LuCheck, LuCode, LuContact, LuCopy, LuFileText, LuGithub, LuLinkedin, LuMail } from 'react-icons/lu';

import { ARCHITECTURE_LINK } from '../footer/Footer';

import './Links.scss';

import facePicture from '../../assets/pics/carlo-headshot.jpg';

// Link-in-bio page for the QR code on business cards (carlotorib.io/links)
function Links() {
    const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
    const RESUME_LINK = process.env.REACT_APP_RESUME_LINK;
    const LINKEDIN_LINK = process.env.REACT_APP_LINKEDIN_LINK;
    const GITHUB_LINK = process.env.REACT_APP_GITHUB_LINK;

    const LINKS = [
        { label: 'Ask my AI assistant', detail: 'carlotorib.io', href: '/', icon: LuBot, featured: true },
        { label: 'Resume', detail: 'PDF', href: RESUME_LINK, icon: LuFileText, external: true },
        { label: 'LinkedIn', detail: 'in/carlotoribio', href: LINKEDIN_LINK, icon: LuLinkedin, external: true },
        { label: 'GitHub', detail: 'crltrbdev', href: GITHUB_LINK, icon: LuGithub, external: true },
        { label: 'How this site was built', detail: 'React, AWS Lambda & OpenAI', href: ARCHITECTURE_LINK, icon: LuCode, external: true },
        { label: 'Save contact', detail: 'Add to your phone', href: '/carlo-toribio.vcf', icon: LuContact, download: true },
        { label: 'Email', detail: EMAIL, href: `mailto:${EMAIL}`, icon: LuMail }
    ];

    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        document.title = 'Carlo Toribio · Links';
    }, []);

    useEffect(() => {
        if (!isCopied) {
            return;
        }
        const timer = setTimeout(() => setIsCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [isCopied]);

    const copyEmail = () => {
        navigator.clipboard?.writeText(EMAIL)
            .then(() => setIsCopied(true))
            .catch((err) => console.error(err));
    };

    return (
        <main className="links-wrapper">
            <header className="profile">
                <img className="avatar" src={facePicture} alt="Carlo Toribio" />
                <h1>Carlo Toribio</h1>
                <p className="title">AI Architect · Sr AI Engineer</p>
                <p className="location">San Diego, CA</p>
                <span className="status">
                    <span className="dot"></span>
                    Open to AI Architect & Sr AI Engineer roles
                </span>
            </header>

            <ul className="link-list">
                {LINKS.map(({ label, detail, href, icon: Icon, featured, external, download }) => (
                    <li key={label}>
                        <a
                            className={`link-button ${featured ? 'featured' : ''}`}
                            href={href}
                            target={external ? '_blank' : undefined}
                            rel={external ? 'noopener noreferrer' : undefined}
                            download={download ? true : undefined}
                        >
                            <Icon className="link-icon" />
                            <span className="link-text">
                                <span className="label">{label}</span>
                                <span className="detail">{detail}</span>
                            </span>
                            <LuArrowRight className="arrow" />
                        </a>
                        {label === 'Email' && (
                            <button
                                className={`copy-button ${isCopied ? 'copied' : ''}`}
                                type="button"
                                onClick={copyEmail}
                                aria-label="Copy email"
                            >
                                {isCopied ? <LuCheck className="copy-icon" /> : <LuCopy className="copy-icon" />}
                                <span>{isCopied ? 'Copied' : 'Copy'}</span>
                            </button>
                        )}
                    </li>
                ))}
            </ul>

            <footer className="links-footer">© {new Date().getFullYear()} Carlo Toribio</footer>
        </main>
    );
}

export default Links;
