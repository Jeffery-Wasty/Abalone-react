import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import GameBoard from './components/GameBoard';
import Settings from './components/Settings';
import BackgroundPic from './image/bk_main1.jpg';
import gamePic from './image/bk.jpg';
import gamePic1 from './image/bk1.jpg';
import './css/App.css';
class App extends Component {

  state = {
    settingVisible: false
  }

  componentWillMount = () => {
    this.setState({
      mainScreen: true
    })
  }

  startGame = (initState) => {
    this.setState({
      mainScreen: false,
      ...initState
    })
    
    this.closeSettings();
  }

  stopGame = () => {
    this.setState({
      mainScreen: true
    })
  }  

  showSettings = () => {
    this.setState({
      settingVisible: true,
    });
  }

  closeSettings = (e) => {
    this.setState({
      settingVisible: false,
    });
  }

  render() {
    return (
      <div className="App">        
        {this.state.mainScreen? 
          <div style={{height: '100vh', backgroundImage: `url(${BackgroundPic})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
            <Button 
              style={{ margin: '35% 0 0 38%', width: 300, height: 100, fontSize: 50, color: '#0026ca', fontFamily: `"Comic Sans MS", cursive, sans-serif` }} 
              size="large" 
              onClick={this.showSettings}
              ghost
              > 
              Start Game 
            </Button>      
            <Modal
            title="Settings"
            visible={this.state.settingVisible}
            onCancel={this.closeSettings}
            footer={null}
            centered
            >
              <Settings startGame={this.startGame} />
            </Modal>    
          </div> : 
          <div style={{height: '100vh', backgroundImage: `url(${this.state.gameType==="pvp"? gamePic : gamePic1})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>    
              <GameBoard 
                stopGame={this.stopGame}
                gameSettings={this.state} 
              />
          </div>
        }        
      </div>
       
    );
  }
}

export default App;
