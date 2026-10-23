import React from 'react';
import { FaAws } from 'react-icons/fa';
import { SiApachespark, SiDatabricks, SiOpenai, SiPython, SiReact } from 'react-icons/si';

import './SkillItem.scss';

// Icon, brand color and the name used in the prefilled question
const SKILLS = {
    OpenAI: { Icon: SiOpenai, color: '#FFFFFF', name: 'OpenAI and LLMs' },
    Python: { Icon: SiPython, color: '#4B8BBE', name: 'Python' },
    Databricks: { Icon: SiDatabricks, color: '#FF3621', name: 'Databricks' },
    Spark: { Icon: SiApachespark, color: '#E25A1C', name: 'Apache Spark' },
    AWS: { Icon: FaAws, color: '#FF9900', name: 'AWS' },
    React: { Icon: SiReact, color: '#61DAFB', name: 'React' }
};

function SkillItem(props) {
    const skill = SKILLS[props.title];
    if (!skill) {
        throw new Error(`Unrecognized skill ${props.title}`);
    }
    const { Icon, color, name } = skill;

    const clickHandler = () => {
        props.onClick?.(`What has Carlo built with ${name}, and how deep is his experience?`);
    }

    return <>
        <button className="skill-item-wrapper" onClick={clickHandler}
            aria-label={`Ask about Carlo's ${name} experience`} title={name}>
            <Icon className="skill-icon" style={{ color }} aria-hidden="true" />
            <span className="skill-label">{props.title}</span>
        </button>
    </>
}

export default SkillItem;
