import React, { Component } from 'react';
import { Button, Modal } from 'antd';
import GameBoard from './components/GameBoard';
import Settings from './components/Settings';
// import AbaloneClient from './utils/AbaloneClient';
import { getInitialState } from './components/InitState';

import BackgroundPic from './image/bk_main1.jpg';
import gamePic from './image/bk.jpg';
class App extends Component {

  state = {
    gameType: "pvp",
    boardInitState: 1,
    playerColor: 2,
    moveLimit: 40,
    timeLimit: 20,
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
    
    // await AbaloneClient.newGame({
    //   boardLayout,
    //   gameMode: this.state.gameType,
    //   playerColor: this.state.playerColor,
    //   turnLimit: this.state.moveLimit,
    //   timeLimit: this.state.timeLimit
    // });

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

      <div>        
        {this.state.mainScreen? 
          <div style={{height: '100vh', backgroundImage: `url(${BackgroundPic})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
            <Button 
              style={{ margin: '35% 0 0 38%', width: 300, height: 100, fontSize: 50, color: '#0026ca' }} 
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
          <div style={{height: '100vh', backgroundImage: `url(${gamePic})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>    
              <GameBoard 
                boardInitState={getInitialState(this.state.boardInitState)} 
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
