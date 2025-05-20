import './Styles/Choice.css';

const Choice = ({ style, number, onClickAnchor }) => {

    return <div style={style} id={`choice-${number}`} className="choice-background">
        Choice#{number}
        <div className="choice-name-text">
            Name: <input type="text" id={`name-${number}-choice`} className="choice-input" />
            Text: <input type="text" id={`name-${number}-choice`} className="choice-input" />
        </div>
        <div className="speech-button-container">
            <input type="button" value="speech" className="choice-button-next" />
            <input type="button" value="choice" className="choice-button-next" />
        </div>
        <div>
            <input type="button" id={`choice-right-${number}-anchor`} onClick={onClickAnchor} className="choice-anchor-button-right" />
            <input type="button" id={`choice-left-${number}-anchor`} onClick={onClickAnchor} className="choice-anchor-button-left" />
        </div>
        <div className="choice-select">
            <select id={`choice-${number}-type-value`}>
                <option value="Text">Text</option>
                <option value="Choice">Choice</option>
            </select>
        </div>
    </div>
};

export default Choice;
