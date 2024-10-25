import React, { useEffect, useState } from 'react';
import parse from 'html-react-parser'
import ReactMarkdown from 'react-markdown';

import { CfUserChatImg, CfAIChatBotImg } from '../../icons/CfIcons';

import './ChatItem.scss';

function ChatItem(props) {
    const { chatItemData, direction = 'row' } = props;

    function getChatItem() {
        switch (chatItemData.itemType) {
            case "query":
                return <QueryChatItem chatItemData={chatItemData} direction={direction} />
            case "streamAnswer":
                return <StreamChatItem chatItemData={chatItemData} direction={direction} />
            default:
                throw new Error(`${chatItemData.itemType} unknown.`)
        }
    }

    return <>{getChatItem()}</>;
}

function QueryChatItem(props) {

    const { chatItemData, direction } = props;
    return <>
        <div className={`query-item-wrapper ${direction}`}>
            <CfUserChatImg className='answer-icon' />
            <span className={'chat-text'}>
                {parse(chatItemData.prompt)}
            </span>
        </div>
    </>
}

function StreamChatItem(props) {
    const [answer, setAnswer] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const { chatItemData, direction } = props;

    useEffect(() => {
        chatItemData.setAnswer = newText => {
            chatItemData.answer = newText;
            setAnswer(newText);
        };

        chatItemData.setIsStreaming = newValue => {
            setIsStreaming(newValue);
        }

        async function streamAnswer() {
            if (!chatItemData.isStreaming) {
                chatItemData.isStreaming = true;

                if (chatItemData.streamFunction) {
                    chatItemData.finalAnswer =
                        await chatItemData.streamFunction(chatItemData)
                            .then(() => {
                                chatItemData.isStreaming = false;
                            });
                }
            } else if (chatItemData.finalAnswer) {
                setAnswer(chatItemData.finalAnswer);
            } else {
                setAnswer(chatItemData.answer);
            }
        }

        streamAnswer();
    }, [chatItemData]);

    return <>
        <div className={`stream-item-wrapper ${direction}`}>
            <CfAIChatBotImg className='answer-icon' />
            <span className={'chat-text'}>
                <ReactMarkdown components={{
                    p: 'span',
                    a: ({ href, children }) => (
                        <a
                          href={href}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {children}
                        </a>
                      )
                }}>
                    {answer}
                </ReactMarkdown>
                <span className={isStreaming ? 'is-streaming' : ''}></span>
            </span>
        </div>
    </>
}

export default ChatItem;