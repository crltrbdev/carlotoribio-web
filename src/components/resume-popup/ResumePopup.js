import React, { useState, useRef, useEffect } from 'react';
import Popup from 'reactjs-popup';

import { FaCheck, FaRing, FaFilePdf, FaPaperPlane, FaAt } from "react-icons/fa";

import './ResumePopup.scss';
import { FaX } from 'react-icons/fa6';

function ResumePopup(props) {
    const {
        isOpen,
        onClose
    } = props;

    const inputRef = useRef(null);

    const [isValid, setIsValid] = useState(false);
    const [email, setEmail] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [])

    const handleEmailSubmit = (close) => {
        if(isValid) {
            submitEmail();
            close();
        }
    };

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setIsValid(emailRegex.test(e.target.value));
    }

    const handleOnKeyDown = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            submitEmail();
        }
    }

    const handleOnClose = (e) => {
        setEmail('');
        onClose(e);
    }

    const submitEmail = () => {
        if (isValid) {
            alert(email);
            console.log('Email submitted:', email);
        } else {
            alert('Invalid email');
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
                        <div className='resume-popup-container'>
                            <div className='resume-popup-title'>
                                <h2>Download Resume</h2>
                            </div>
                            <div className='resume-popup-content'>
                                <div className='content'>
                                    <FaFilePdf className='download-icon' />
                                    <p>
                                        Get instant access to my resume! Enter your email below, and I’ll send you a private link to download the PDF.
                                    </p>
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
                    </div>
                )}
            </Popup>
        </>
    );
}

export default ResumePopup;