import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyComponent = () => {
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [nextTextButton, setNextTextButton] = useState(false);
    const [choicesButton, setChoicesButton] = useState(false);
    const [choiceInfo, setChoice] = useState(null);

    const UpdateText = () => {
        axios.get('https://localhost:7252/Main/NextTextWithoutChoice')
            .then(response => {
                const data = response.data;
                setText(data.text._Text);
                setName(data.text._CharacterName);
                setImage(data.image._ImageData);

                if (data.text._NextChoiceID != 0) {
                    setNextTextButton(true);
                    setChoice(data.choice);
                }
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении запроса:', error);
            });
    }

    const CallNextTextFromChoice = (nextChoiceID) => {
        axios.post('https://localhost:7252/Main/NextTextFromChoice', { id: nextChoiceID }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                const data = response.data;
                setText(data.choice.text);
                setName(data.choice.characterName);
                setImage(data.image._ImageData);
                console.log(data.choice);
                if(data.choice.nextChoiceID == 0) {
                    setChoicesButton(true);
                    setNextTextButton(false);
                    console.log("There must be off")
                }
            })
            .catch(error => {
                console.log(nextChoiceID);
                console.error('Error:', error);
            });
    }


    return (
        <div>
            <input type="button" value="Update name and text" onClick={UpdateText} disabled={nextTextButton}/>
            <p>Текст: {text}</p>
            <p>Имя: {name}</p>
            <div>
                {image ? <img src={`data:image/png;base64,${image}`} alt="Image"/> :
                    <p>Изображение недоступно</p>}
            </div>
            {choiceInfo && choiceInfo.map((choice, index) => {
                return (
                    <div key={index}>
                        <button 
                            onClick={() => CallNextTextFromChoice(choice.nextChoiceID)} disabled={choicesButton}>{choice.text}</button>
                    </div>
                );
            })}
        </div>
    );
}

export default MyComponent; 
