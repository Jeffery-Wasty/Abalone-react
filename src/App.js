import React, { Component } from 'react';
import GameBoard from './components/GameBoard';
import './App.css';
import { Row, Col, Button } from 'antd';

class App extends Component {
  render() {
    return (
      <div className="App">    
      <Row>
        <Col xs={2} sm={4} md={6} lg={8} xl={10}><Button type="primary">Primary</Button></Col>
        <Col xs={20} sm={16} md={12} lg={8} xl={4}><Button type="primary">Primary</Button></Col>
        <Col xs={2} sm={4} md={6} lg={8} xl={10}><Button type="primary">Primary</Button></Col>
      </Row>   
      </div>
    );
  }
}

export default App;
