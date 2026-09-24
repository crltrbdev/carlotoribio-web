import React from 'react';
import { FaBolt, FaRegClock } from 'react-icons/fa';

import './QuestionMeter.scss';

function QuestionMeter(props) {
    const {
        maxQuestions,
        questionsLeft,
        countdown
    } = props;

    const isDepleted = questionsLeft <= 0;
    const isLast = questionsLeft === 1;

    const pips = Array.from({ length: maxQuestions }, (_, index) => index < questionsLeft);

    return <div className={`question-meter${isDepleted ? ' depleted' : ''}${isLast ? ' last-one' : ''}`}>
        <span className="meter-icon">
            {isDepleted ? <FaRegClock /> : <FaBolt />}
        </span>

        <span className="meter-pips">
            {pips.map((isAvailable, index) =>
                <span
                    key={index}
                    className={`pip${isAvailable ? ' available' : ' spent'}`} />)}
        </span>

        <span className="meter-label">
            {
                isDepleted
                    ? <>out of questions{countdown ? <> · back in <b>{countdown}</b></> : null}</>
                    : <><b>{questionsLeft}</b> of {maxQuestions} question{maxQuestions === 1 ? '' : 's'} left</>
            }
        </span>
    </div>
}

export default QuestionMeter;
