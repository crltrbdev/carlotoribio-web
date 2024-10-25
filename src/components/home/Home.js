import React from 'react';

import logoImg from '../../assets/images/logos/logo.png';
import face4 from '../../assets/pics/face4.jpg';

import './Home.scss';
import Chat from '../chat/Chat';
import { FaAt, FaFileDownload, FaGithub } from 'react-icons/fa';
import { FaLinkedin } from 'react-icons/fa6';

function Home(props) {
    const EMAIL = process.env.REACT_APP_CONTACT_EMAIL;
    const RESUME_LINK = process.env.REACT_APP_RESUME_LINK;
    const LINKEDIN_LINK = process.env.REACT_APP_LINKEDIN_LINK;
    const GITHUB_LINK = process.env.REACT_APP_GITHUB_LINK;

    return <>
        <section className={`home-wrapper ${props.className}`}>
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
                            <a href={`mailto:${EMAIL}`}  rel='noopener noreferrer'>
                                <FaAt className="email" />
                            </a>
                        </div>
                        <label className="subtitle">Software Architect & Full-Stack Engineer</label>
                        <label className="summary">
                        Welcome! I’m Carlo Toribio. <span className='mobile-hide'>I'm a software engineer and solutions architect with over a decade of experience in the tech industry.It's my professional career and hobby to create innovative solutions and playing with emerging technologies.</span> Ask my GPT about my professional experience.
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
                    <a href={RESUME_LINK} target="_blank" rel='noopener noreferrer'>
                        <FaFileDownload className="icon resume" />
                    </a>
                </div>
            </header>
            <section className='main-container'>
                <div className="logo-image">
                    <img src={logoImg} alt="logo" />
                </div>
                <div className="chat-container">
                    <Chat />
                </div>
            </section>
        </section>
    </>
}

export default Home;