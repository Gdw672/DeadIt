import React from 'react';
import axios from 'axios';

class MyComponent extends React.Component {
  handleClick = () => {
    axios.get('https://localhost:7252/Main/NextTextWithoutChoice')
        .then(response => {
          console.log('Метод успешно вызван. Результат: ', response.data);
        })
        .catch(error => {
          console.error('Ошибка при вызове метода:', error)
          ;
        });
  }

  render() {
    return (
        <div>
          <button onClick={this.handleClick}>Вызвать метод</button>
        </div>
    );
  }
}

export default MyComponent;
