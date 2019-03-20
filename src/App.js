import React, { Component } from 'react';
import { Button, Col, Progress, Row, Modal } from 'antd';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import Settings from './components/Settings';
import AbaloneClient from './utils/AbaloneClient';
import BackgroundPic from './image/bk_main1.jpg';

class App extends Component {

  state = {
    gameType: "pvp",
    boardInitState: "1",
    playerColor: "black",
    moveLimit: "40",
    timeLimit: "10",
    pause: false,
    progress: 100,
    timeLeft: 0,
    settingVisible: false
  }

  componentWillMount = () => {
    this.setState({
      mainScreen: true
    })
  }

  startGame = (initState) => {
    this.setState({
      timeLeft: parseInt(this.state.timeLimit),
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

    this.startTimer();
  }

  pauseGame = () => {
    if (this.state.pause) {
      this.setState({ pause: false })
      this.startTimer()
    } else {
      this.setState({ pause: true })
    }
  }

  stopGame = () => {
    this.setState({
      mainScreen: true
    })

    this.closeSettings();
  }

  resetGame = () => {
    window.location.reload()
  }

  undoLastMove = () => {

  }

  makeMove = () => {
    this.setState({
      timeLeft: 0,
      progress: 100,
      pause: false
    })
    this.startTimer();

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

  startTimer = () => {
    const period = 100;

    let clock = setInterval(() => {
      if (this.state.pause) {
        clearInterval(clock);
      } else {
        if (this.state.timeLeft > 0) {
          let timeLeft = this.state.timeLeft - 1 / period;
          let progress = parseInt(timeLeft * 100 / parseInt(this.state.timeLimit));

          this.setState({
            timeLeft, progress
          })
        } else {
          clearInterval(clock);
        }
      }
    }, 1000 / period);
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
          <div>
            <Row>
              <Col>
                <div style={{ margin: "50px 200px 50px 260px" }}>
                  <Progress strokeLinecap="square" percent={this.state.progress} />
                </div>

              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <div style={{ margin: "10px 0 0 50px" }}>
                  {(this.state.status === "stop") ?
                    <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.pauseGame} disabled>
                      {this.state.status === "pause" ? "Resume" : "Pause"}
                    </Button> :
                    <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.pauseGame}>
                      {this.state.status === "pause" ? "Resume" : "Pause"}
                    </Button>
                  }

                  {(this.state.status === "stop") ?
                    <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.stopGame} disabled> Stop </Button> :
                    <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.stopGame}> Stop </Button>
                  }

                  <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.resetGame}> Reset </Button>
                  <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.undoLastMove}> Undo </Button>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginLeft: 50 }}>
                  <GameBoard />
                </div>
              </Col>
              <Col span={9}>
                  <GameInfo/>
              </Col>
            </Row>
          </div>
        }        
      </div>
       
    );
  }
}

export default App;
