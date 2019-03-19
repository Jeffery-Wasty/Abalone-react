import React, { Component } from 'react';
import GameBoard from './components/GameBoard';
import './App.css';
import { Row, Col, Button } from 'antd';

class App extends Component {
  render() {
    return (
      <div className="App">    
      <Row>
        <Col span={14}>
        <div style={{margin: '100px 0 0 200px'}}>            
          <GameBoard />
        </div>
        </Col>
        <Col span={10}>
          <div style={{margin: '100px 200px 0 0', minHeight: 450, border: "1px solid"}}>

          </div>
        </Col>>
      </Row>   
      </div>
    );
  }
}

export default App;
