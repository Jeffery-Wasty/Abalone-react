import React, { Component } from 'react';
import { Button, Col, Progress, Row, Modal } from 'antd';
import GameBoard from './components/GameBoard';
import GameInfo from './components/GameInfo';
import Settings from './components/Settings';
import AbaloneClient from './utils/AbaloneClient';
import BackgroundPic from './image/bk_main1.jpg';
import gamePic from './image/bk.jpg';
import { getInitialState } from './components/InitState';

class App extends Component {

  state = {
    gameType: "pvp",
    boardInitState: 1,
    playerColor: "black",
    moveLimit: 40,
    timeLimit: 20,
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
    console.log(initState);
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
          <div style={{height: '100vh', backgroundImage: `url(${gamePic})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
            <Row>
              <Col>
                  <div style={{ margin: 30 }}>
                    <Row gutter={4}>
                      <Col span={2} offset={2}> 
                        <Button type="primary" size="large" icon={this.state.status === "pause" ? "caret-right": "pause-circle" } onClick={this.pauseGame} block>
                          {this.state.status === "pause" ? "Resume" : "Pause"}
                        </Button>
                      </Col>
                      <Col span={2}> 
                        <Button type="danger" size="large" icon="stop" onClick={this.stopGame} block> Stop </Button>
                      </Col>
                      <Col span={2}> 
                        <Button size="large" icon="rollback" onClick={this.resetGame} block> Reset </Button>
                      </Col>
                      <Col span={2}> 
                        <Button type="dashed" icon="backward" size="large" onClick={this.undoLastMove} block> Undo </Button>
                      </Col>
                    </Row>
                  </div>
                </Col>
            </Row>

            <Row>
              <Col span={11} offset={1}>
                <div>
                  <GameBoard boardInitState={getInitialState(this.state.boardInitState)} />
                </div>
                
                <div style={{ margin: 20 }}>
                  <Progress showInfo={false} strokeWidth={30} strokeColor="red" strokeLinecap="round" percent={this.state.progress} />
                </div>
              </Col>
              <Col span={10} offset={1}>
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
