import React, { useState, useRef, useEffect } from 'react';
import Popup from 'reactjs-popup';

import openAIService from '../../services/OpenAIService';
import { FaPaperPlane, FaAt, FaEnvelope } from "react-icons/fa";

import './ResumePopup.scss';

function ResumePopup(props) {
    const {
        isOpen,
        onClose
    } = props;

    const inputRef = useRef(null);

    const [isValid, setIsValid] = useState(false);
    const [email, setEmail] = useState('');
    const [isEmailSent, setIsEmailSent] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [])

    const handleEmailSubmit = (close) => {
        if(isValid) {
            submitEmail();
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setIsValid(emailRegex.test(e.target.value));
    }

    const handleOnKeyDown = (e) => {
        if (isValid) {
            if (e.key === 'Enter' || e.type === 'click') {
                submitEmail();
            }
        }
    }

    const handleOnClose = (e) => {
        setEmail('');
        setIsEmailSent(false);
        setIsValid(false);
        onClose(e);
    }

    const submitEmail = async () => {
        if (isValid) {
            openAIService.sendResumEmail(email);
            setIsEmailSent(true);
        }
    }

    return (
        <>
            <Popup
                open={isOpen}
                modal
                overlayStyle={{
                    background: 'rgba(0, 0, 0, 0.85)'
                }}
                onClose={handleOnClose}
                closeOnEscape
                closeOnDocumentClick>
                {close => (
                    <div className='resume-popup-wrapper'>
                        <div className={'resume-popup-container' + (isEmailSent ? ' hide-form' : '')}>
                            <div className='resume-popup-title'>
                                <h2>Download Resume</h2>
                            </div>
                            <div className='resume-popup-content'>
                                <div className='content'>
                                    <FaEnvelope className='download-icon' />
                                    <div>
                                        <p>
                                            Enter your email below to receive a link to download my resume instantly.
                                        </p>
                                        <p className='email-usage-text'>
                                            Your email will only be used to send the requested resume. We won’t share your email or send additional messages.
                                        </p>
                                    </div>
                                </div>
                                <div className='email-input-container'>
                                    <div className={'dotio-input'}>
                                        <div className='input-wrapper'>
                                            <input
                                                ref={inputRef}
                                                type='email'
                                                placeholder='Email'
                                                value={email}
                                                onChange={handleEmailChange}
                                                onKeyDown={handleOnKeyDown} />
                                        </div>
                                        <div className='send-icon-wrapper'>
                                            <FaPaperPlane
                                                className={'send-icon' + (isValid ? '' : ' invalid')}
                                                onClick={() => handleEmailSubmit(close)} />
                                        </div>
                                    </div>
                                    <div>
                                        <FaAt className={'at-icon' + (isValid ?  '' : ' invalid')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className={'resume-sent-container'  + (isEmailSent ? '' : ' hide-sent-message')} 
                            onClick={close}>
                            <h3 className='resume-sent-title'>
                                Thank you for your interest in my resume.
                            </h3>
                            <p className='resume-sent-content'>
                                An email with a link to my resume has been sent to your email address.
                                <br />
                                <strong>Please make sure to check your spam folder!</strong>
                            </p>
                            <p className='resume-sent-close'>
                                (Click anywhere or press esc to close)
                            </p>
                            <p className='resume-sent-close-mbl'>
                                (Tap anywhere to close)
                            </p>
                        </div>
                    </div>
                )}
            </Popup>
        </>
    );
}

export default ResumePopup;