import React, { useEffect, useState } from 'react';
import { FaAt, FaGithub } from 'react-icons/fa';
import { FaChevronDown, FaFileLines, FaLinkedin } from 'react-icons/fa6';

import Chat from '../chat/Chat';

import './Home.scss';

import facePicture from '../../assets/pics/carlo-headshot.jpg';
import logoImg from '../../assets/images/logos/logo.png';
import { typeWords } from '../../util/typeWords';

const HERO_GREETING = "Hi, I'm Carlo.";
const MOBILE_QUERY = '(max-width: 768px)';

// Approved tagline + intro pairs; one is picked at random on each visit
const HERO_TAGLINES = [
    { tagline: 'I architect AI systems that ship.', lede: 'Not slideware: AI systems designed to run, scale and last, backed by 15+ years of enterprise engineering in finance, health and education.' },
    { tagline: 'I turn AI demos into production software.', lede: 'The demo is the easy part. I build what comes after: the reliability, testing and scale that keep AI working when real users show up.' },
    { tagline: 'I build production-grade RAG assistants.', lede: 'AI that knows your business because it reads your documents, and gives answers your team can check and trust.' },
    { tagline: 'I design multi-agent AI for the enterprise.', lede: 'Teams of AI agents that split the work, hand off cleanly and get it done, designed for real enterprise workloads.' },
    { tagline: 'I lead teams that ship AI to production.', lede: 'Clear priorities, steady releases and engineers who grow. I lead from the front and still roll up my sleeves when the work needs it.' },
    { tagline: 'I turn AI models into reliable products.', lede: 'Less hype, more working software: chatbots, document search and automation, built on 15+ years of enterprise engineering.' }
];

function Home(props) {
    const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
    const RESUME_LINK = process.env.REACT_APP_RESUME_LINK;
    const LINKEDIN_LINK = process.env.REACT_APP_LINKEDIN_LINK;
    const GITHUB_LINK = process.env.REACT_APP_GITHUB_LINK;

    const [{ tagline, lede }] = useState(() => HERO_TAGLINES[Math.floor(Math.random() * HERO_TAGLINES.length)]);
    const [typedGreeting, setTypedGreeting] = useState('');
    const [typedTagline, setTypedTagline] = useState('');
    const [isGreetingTyped, setIsGreetingTyped] = useState(false);
    const [isTyping, setIsTyping] = useState(true);
    // On phones the hero folds into a one-line bar once the visitor starts using the chat
    const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

    function collapseHero() {
        if (window.matchMedia?.(MOBILE_QUERY).matches) {
            setIsHeroCollapsed(true);
        }
    }

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

    return (
        <>
            <section className={`home-wrapper ${props.className}`}>
                <nav className="top-nav">
                    <div className="identity">
                        <img className="logo" src={logoImg} alt="" />
                        <div className="name-block">
                            <span className="name">Carlo Toribio</span>
                            <span className="role">Sr AI Engineer · AI Architect</span>
                        </div>
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
                        <a className="resume-button" href={RESUME_LINK} target="_blank" rel='noopener noreferrer'>
                            <FaFileLines className="resume-icon" />
                            <span>Resume</span>
                        </a>
                    </div>
                </nav>
                <section className={`main-container ${isHeroCollapsed ? 'hero-collapsed' : ''}`}>
                    {isHeroCollapsed && (
                        <button className="hero-compact" aria-label="Show intro" aria-expanded="false"
                            onClick={() => setIsHeroCollapsed(false)}>
                            <img className="compact-photo" src={facePicture} alt="" />
                            <span className="compact-text">
                                <span className="compact-greeting">{HERO_GREETING}</span>
                                <span className="compact-tagline">{tagline}</span>
                            </span>
                            <FaChevronDown className="compact-chevron" />
                        </button>
                    )}
                    <div className="hero" aria-hidden={isHeroCollapsed}>
                        <div className="hero-inner">
                            <img className="hero-photo" src={facePicture} alt="Carlo Toribio" />
                            <span className="status">
                                <span className="dot"></span>
                                Open to Sr AI Engineer & AI Architect roles<span className="mobile-hide"> · San Diego, CA</span>
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
                            <p className={`lede ${isTyping ? '' : 'visible'}`}>
                                {lede} <span className="cta mobile-hide">Skip the resume and ask my AI assistant.</span>
                            </p>
                        </div>
                    </div>
                    <div className="chat-container">
                        <Chat onEngage={collapseHero} />
                    </div>
                </section>
            </section>
        </>
    );
}

export default Home;
