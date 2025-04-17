import './Styles/Speech.css';

const Speech = ({ style, number, onClickAnchor }) => {

    return <div style={style} className="speech-background">
        Speech#{number}
        <div className="speech-name-text">
            Name: <input type="text" className="speech-input" />
            Text: <input type="text" className="speech-input" />
        </div>
        <div className="speech-button-container">
            <input type="button" value="speech" className="speech-button-next" />
            <input type="button" value="choice" className="speech-button-next" />
        </div>
        <div>
            <input type="button" id={`${number}-right`} onClick={onClickAnchor} className="speech-anchor-button-right" />
            <input type="button" id={`${number}-left`} onClick={onClickAnchor} className="speech-anchor-button-left" />
        </div>
    </div>
};

export default Speech;
