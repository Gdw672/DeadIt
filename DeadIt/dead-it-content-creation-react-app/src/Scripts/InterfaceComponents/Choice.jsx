import './Styles/Choice.css';

const Choice = ({ style, number, onClickAnchor }) => {

    return <div style={style} className="choice-background">
        Choice#{number}
        <div className="choice-name-text">
            Name: <input type="text" className="choice-input" />
            Text: <input type="text" className="choice-input" />
        </div>
        <div className="speech-button-container">
            <input type="button" value="speech" className="choice-button-next" />
            <input type="button" value="choice" className="choice-button-next" />
        </div>
        <div>
            <input type="button" id={`choice-anchor-${number}-right`} onClick={onClickAnchor} className="choice-anchor-button-right" />
            <input type="button" id={`choice-anchor-${number}-left`} onClick={onClickAnchor} className="choice-anchor-button-left" />
        </div>
        <div className="choice-select">
            <select>
                <option value="Text">Text</option>
                <option value="Choice">Choice</option>
            </select>
        </div>
    </div>
};

export default Choice;
