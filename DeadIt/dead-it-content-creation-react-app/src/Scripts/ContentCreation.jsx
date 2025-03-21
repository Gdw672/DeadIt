    import axios from 'axios';
    import React, { useState, useEffect } from 'react';


    const ContentCreation = () => {
        const [text, setText] = useState('');

        const testRequest = () => {
            axios.get("http://localhost:5181/api/ContentCreation/GetAnswer")
                .then(response => {
                    setText(response.data);
                })
        }

        return (
            <div>
                <input type="button" value={text} onClick={testRequest}></input>
            </div>
        )
}

export default ContentCreation;
