import React, { useEffect, useState } from 'react';
import { FaAt, FaGithub } from 'react-icons/fa';
import { FaFileLines, FaLinkedin } from 'react-icons/fa6';

import Chat from '../chat/Chat';
import ResumePopup from '../resume-popup/ResumePopup';

import './Home.scss';

import facePicture from '../../assets/pics/carlo-headshot.jpg';
import { typeWords } from '../../util/typeWords';

const HERO_GREETING = "Hi, I'm Carlo.";

// Approved taglines; one is picked at random on each visit
const HERO_TAGLINES = [
    'I architect AI systems that ship.',
    'I turn AI demos into production software.',
    'I build production-grade RAG assistants.',
    'I design multi-agent AI for the enterprise.',
    'I lead teams that ship AI to production.',
    'I turn AI models into reliable products.'
];

function Home(props) {
    const [isResumePopupOpen, setIsResumePopupOpen] = useState(false);

    const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
    const LINKEDIN_LINK = process.env.REACT_APP_LINKEDIN_LINK;
    const GITHUB_LINK = process.env.REACT_APP_GITHUB_LINK;

    const [tagline] = useState(() => HERO_TAGLINES[Math.floor(Math.random() * HERO_TAGLINES.length)]);
    const [typedGreeting, setTypedGreeting] = useState('');
    const [typedTagline, setTypedTagline] = useState('');
    const [isGreetingTyped, setIsGreetingTyped] = useState(false);
    const [isTyping, setIsTyping] = useState(true);

    const typingDelay = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 0 : 120;

    // Type the greeting first, then the tagline
    useEffect(() => {
        return typeWords(HERO_GREETING, setTypedGreeting, {
            delay: typingDelay,
            onDone: () => setIsGreetingTyped(true)
        });
    }, [typingDelay]);

    useEffect(() => {
        if (!isGreetingTyped) {
            return;
        }
        return typeWords(tagline, setTypedTagline, {
            delay: typingDelay,
            onDone: () => setIsTyping(false)
        });
    }, [isGreetingTyped, tagline, typingDelay]);

    const cursor = <span className={isTyping ? 'typing-cursor' : ''}></span>;

    const openPopup = () => {
        setIsResumePopupOpen(true);
    }

    const closePopup = () => {
        setIsResumePopupOpen(false);
    }

    return (
        <>
            <section className={`home-wrapper ${props.className}`}>
                <ResumePopup
                    isOpen={isResumePopupOpen}
                    onClose={closePopup}>
                </ResumePopup>
                <nav className="top-nav">
                    <div className="identity">
                        <img className="avatar" src={facePicture} alt="Carlo Toribio" />
                        <span className="name">Carlo Toribio</span>
                    </div>

                    <div className="social">
                        <a href={GITHUB_LINK} target="_blank" rel='noopener noreferrer' aria-label="GitHub">
                            <FaGithub className="icon" />
                        </a>
                        <a href={LINKEDIN_LINK} target="_blank" rel='noopener noreferrer' aria-label="LinkedIn">
                            <FaLinkedin className="icon" />
                        </a>
                        <a href={`mailto:${EMAIL}`} rel='noopener noreferrer' aria-label="Email">
                            <FaAt className="icon" />
                        </a>
                        <button className="resume-button" onClick={openPopup}>
                            <FaFileLines className="resume-icon" />
                            <span>Resume</span>
                        </button>
                    </div>
                </nav>
                <section className='main-container'>
                    <div className="hero">
                        <span className="status">
                            <span className="dot"></span>
                            Open to Sr AI Engineer & AI Architect roles<span className="mobile-hide"> · Claude Certified Architect</span>
                        </span>
                        <h1 aria-label={`${HERO_GREETING} ${tagline}`}>
                            {/* Invisible full text reserves the final size so nothing shifts while typing */}
                            <span className="ghost" aria-hidden="true">
                                {HERO_GREETING} <span className="accent">{tagline}</span>
                            </span>
                            <span className="typed" aria-hidden="true">
                                {typedGreeting}
                                {!typedTagline && cursor}
                                <span className="accent">{typedTagline}{typedTagline && cursor}</span>
                            </span>
                        </h1>
                        <p className="lede">
                            RAG assistants, multi-agent workflows and the platforms behind them, built over 15+ years in finance, health and education. <span className="mobile-hide">Skip the resume and ask my AI assistant.</span>
                        </p>
                    </div>
                    <div className="chat-container">
                        <Chat openResumePopup={openPopup} />
                    </div>
                </section>
            </section>
        </>
    );
}

export default Home;
