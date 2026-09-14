import React, { useState } from 'react';
import { FaAt, FaGithub } from 'react-icons/fa';
import { FaFileLines, FaLinkedin } from 'react-icons/fa6';

import Chat from '../chat/Chat';
import ResumePopup from '../resume-popup/ResumePopup';

import './Home.scss';

import logoImg from '../../assets/images/logos/logo.png';
import face4 from '../../assets/pics/face4.jpg';

function Home(props) {
    const [isResumePopupOpen, setIsResumePopupOpen] = useState(false);

    const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
    const LINKEDIN_LINK = process.env.REACT_APP_LINKEDIN_LINK;
    const GITHUB_LINK = process.env.REACT_APP_GITHUB_LINK;

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
                <header>
                    <div className="profile-picture">
                        <div className='profile-pic-container'>
                            <img src={face4} alt="profile" />
                        </div>
                    </div>

                    <div className="profile-info">
                        <div className="name-role">
                            <div className="name-email">
                                <label className="title">Carlo Toribio</label>
                                <a href={`mailto:${EMAIL}`} rel='noopener noreferrer'>
                                    <FaAt className="email" />
                                </a>
                            </div>
                            <label className="subtitle">Software Architect & AI Enthusiast at KPMG</label>
                            <label className="summary">
                                Welcome! I’m Carlo Toribio, a software architect at KPMG US. <span className='mobile-hide'>I merge technical prowess with strategic foresight across 15+ years of enterprise architecture in the health, financial and education industries — leading cloud transformations, modernizing legacy platforms, and exploring where AI genuinely belongs in a product.</span> Ask my OpenAI Chatbot about my professional experience.
                            </label>
                        </div>
                    </div>

                    <div className="social">
                        <a href={GITHUB_LINK} target="_blank" rel='noopener noreferrer'>
                            <FaGithub className="icon" />
                        </a>
                        <a href={LINKEDIN_LINK} target="_blank" rel='noopener noreferrer'>
                            <FaLinkedin className="icon" />
                        </a>
                        <FaFileLines onClick={openPopup} className="icon resume" />
                    </div>
                </header>
                <section className='main-container'>
                    <div className="logo-image">
                        <img src={logoImg} alt="logo" />
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