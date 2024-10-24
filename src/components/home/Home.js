import React, { useState } from 'react';

import linkedinImg from '../../assets/media/linkedin.png';
import githubImg from '../../assets/media/github.png';
import emailImg from '../../assets/media/email.png';
import logoImg from '../../assets/images/logos/logo.png';
import face4 from '../../assets/pics/face4.jpg';

import './Home.scss';
import Chat from '../chat/Chat';

function Home(props) {
    

    return <>
        <section className={`home-wrapper ${props.className}`}>
            <header>
                <div className="profile-picture">
                    <div className="profile-pic-container">
                        <img src={face4} />
                    </div>
                </div>

                <div className="profile-info">
                    <div className="name-role">
                        <label className="title">Carlo Toribio</label>
                        <label className="subtitle">Software Architect & Full-Stack Engineer</label>
                        <label className="summary">
                        Welcome! I’m Carlo Toribio. <span className='mobile-hide'>I'm a software engineer and solutions architect with over a decade of experience in the tech industry.It's my professional career and hobby to create innovative solutions and playing with emerging technologies.</span>Ask my GPT about my professional experience.
                        </label>
                    </div>
                </div>

                <div className="social">
                    <a href="https://www.linkedin.com/in/carlotoribio/" target="_blank">
                        <img className="linkedin" src={linkedinImg} />
                    </a>
                    <a href="https://github.com/crltrbdev?tab=repositories" target="_blank">
                        <img className="github" src={githubImg} />
                    </a>
                    <a href="mailto:carlo.toribio.dev@gmail.com" target="_blank">
                        <img className="resume" src={emailImg} />
                    </a>
                </div>
            </header>
            <section className='main-container'>
                <div className="logo-image">
                    <img src={logoImg} />
                </div>
                <div className="chat-container">
                    <Chat />
                </div>
            </section>
        </section>
    </>
}

export default Home;