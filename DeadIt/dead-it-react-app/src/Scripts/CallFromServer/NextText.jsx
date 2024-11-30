import React, { useState, useEffect } from 'react';
import './NextText.css';
import axios from 'axios';

const NextText = () => {
    const [text, setText] = useState('');
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [background, setBackground] = useState('');
    const [nextTextButton, setNextTextButton] = useState(false);
    const [choicesButton, setChoicesButton] = useState(false);
    const [choiceInfo, setChoice] = useState(null);

    const UpdateText = () => {
        axios.get('https://localhost:7252/Main/NextTextWithoutChoice')
            .then(response => {
                GetBackground();
                const data = response.data;
                setText(data.text._Text);
                setName(data.text._CharacterName);
                setImage(data.image._ImageData);

                if (data.text._NextChoiceID !== 0) {
                    setNextTextButton(true);
                    setChoice(data.choice);
                }
            })
            .catch(error => {
                console.error('Произошла ошибка при выполнении запроса:', error);
            });
    }

    const GetBackground = () => {
        axios.get('https://localhost:7252/Main/GetBackground')
            .then(response => {
                const data = response.data;
                setBackground(data);
            }).catch(error => {
                console.error('Произошла ошибка при выполнении запроса на background');
            })
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
                if (data.choice.nextChoiceID === 0) {
                    setChoicesButton(true);
                    setNextTextButton(false);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <div>
            <input type="button" value="Update name and text" onClick={UpdateText} disabled={nextTextButton} />
            <p className="text">Текст: {text}</p>
            <p>Имя: {name}</p>
            <div class="image-container">
                {image ? <img src={`data:image/png;base64,${image}`} alt="Image" class="character"/> :
                    <p>Изображение недоступно</p>}
                {background ? <img src={`data:image/jpeg;base64,${background}`} alt="Background image" class="background"/> :
                <p>Задний фон недоступен</p>
            }

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

export default NextText;
