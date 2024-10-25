import React from 'react';

import './SkillItem.scss';

import androidImg from '../../assets/images/skills/android.png';
import angularImg from '../../assets/images/skills/angular.png';
import awsImg from '../../assets/images/skills/aws.png';
import azureImg from '../../assets/images/skills/azure.png';
import chatgptImg from '../../assets/images/skills/chatgpt.png';
import dotnetImg from '../../assets/images/skills/dotnet.png';
import iosImg from '../../assets/images/skills/ios.png';
import javaImg from '../../assets/images/skills/java.png';
import reactImg from '../../assets/images/skills/react.png';

function SkillItem(props) {
    const getImage = () => {
        switch (props.title) {
            case 'Android':
                return androidImg;
            case 'Angular':
                return angularImg;
            case 'AWS':
                return awsImg;
            case 'Azure':
                return azureImg;
            case 'OpenAI':
                return chatgptImg;
            case 'DotNet':
                return dotnetImg;
            case 'iOS':
                return iosImg;
            case 'Java':
                return javaImg;
            case 'React':
                return reactImg;
            default:
                throw new Error(`Unrecognized skill ${props.title}`);
        }
    }

    const clickHandler = () => {
        if (props.onClick) {
            props.onClick(
                `Tell me more about Carlo's experience with ${props.title}`
            );
        }
    }

    return <>
        <section className="skill-item-wrapper" onClick={clickHandler}>
            <div className={'skill-icon ' + props.title.toLowerCase()} >
                <img src={getImage()} alt="skill" />
            </div>
        </section>
    </>
}

export default SkillItem;