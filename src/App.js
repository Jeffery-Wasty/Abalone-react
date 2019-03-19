import React, { Component } from 'react';
import GameBoard from './components/GameBoard';
import './App.css';
import { Row, Col, Button, Radio, Drawer, InputNumber, Progress, Timeline } from 'antd';
import Background from './bk.jpg';

class App extends Component {

  state = {
    gameType: "pvp",
    initState: "1",
    settingVisible: false,
    playerColor: "black",
    moveLimit: "40",
    timeLimit: "10",
    status: "stop",
    progress: 100,
    timeLeft: 0
  }

  handleGameType = (e) => {
    this.setState({ gameType: e.target.value });
  }

  handleInitState = (e) => {
    this.setState({ initState: e.target.value });
  }

  handleColorSelection = (e) => {
    this.setState({ playerColor: e.target.value });
  }

  handleMoveLimit = (e) => {
    this.setState({ moveLimit: e });
  }

  handleTimeLimit = (e) => {
    this.setState({ timeLimit: e });
  }

  showDrawer = () => {
    this.setState({
      settingVisible: true,
    });
  };

  onClose = () => {
    this.setState({
      settingVisible: false,
    });
  };

  startGame = () => {
    this.setState({
      status: "start",
      timeLeft: parseInt(this.state.timeLimit)
    })

    this.onClose();
    this.startTimer();
  }

  pauseGame = () => {
    if (this.state.status === "pause") {
      this.setState({ status: "start" })
      this.startTimer()
    } else {
      this.setState({ status: "pause" })
    }
  }

  stopGame = () => {
    this.setState({
      status: "stop"
    })
  }

  resetGame = () => {
    window.location.reload()
  }

  undoLastMove = () => {

  }

  startTimer = () => {
    const period = 100;

    let clock = setInterval(() => {
      if (this.state.status === "pause") {
        clearInterval(clock);
      } else if (this.state.status === "stop") {
        clearInterval(clock);
        this.setState({
          timeLeft: 0,
          progress: 100
        })
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
      <div style={{backgroundImage: `url(${Background})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover'}}>
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
              <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.showDrawer}> Start Game </Button>
              {(this.state.status === "stop")? 
                <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.pauseGame} disabled> 
                  {this.state.status === "pause" ? "Resume" : "Pause"} 
                </Button> : 
                <Button style={{ margin: 15, width: 110 }} type="primary" size="large" onClick={this.pauseGame}> 
                  {this.state.status === "pause" ? "Resume" : "Pause"} 
                </Button>
              } 
              
              {(this.state.status === "stop")? 
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
            <div style={{ margin: '0 200px 0 0', minHeight: 620, border: "1px solid #eeeeee", backgroundColor: "#eeeeee"}}>
                <div style={{margin: 20}}>
                  <h3> - White Player</h3>
                  <h4>Game Score: 3</h4>                
                  <h4>Time taken: 40s</h4>                  
                  <h4>Moves taken: 10</h4>  
                  <h4>Next move: Move G8 to top right</h4>
                  <Timeline>
                    <Timeline.Item>Move A1 to right</Timeline.Item>
                    <Timeline.Item>Move B3 to top left</Timeline.Item>
                    <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left</Timeline.Item>
                  </Timeline>

                  <h3> - Black Player</h3>
                  <h4>Game Score: 2</h4>
                  <h4>Time taken: 20s</h4>
                  
                  <h4>Moves taken: 11</h4>
                  <h4>Next move: Move G8 to top right</h4>
                  <Timeline>
                    <Timeline.Item>Move A1 to right</Timeline.Item>
                    <Timeline.Item>Move B3 to top left</Timeline.Item>
                    <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left</Timeline.Item>
                    <Timeline.Item>Move D3 C3 to left</Timeline.Item>
                  </Timeline>
                </div>
            </div>
          </Col>
        </Row>


        <Drawer
          title="Game Settings"
          placement="right"
          width={600}
          closable={false}
          onClose={this.onClose}
          visible={this.state.settingVisible}
        >
          <div style={{ margin: 20 }}>

            <div style={{ margin: 20 }}>
              <h3>Board Layout</h3>
              <Radio.Group value={this.state.initState} onChange={this.handleInitState}>
                <Radio.Button style={{ width: 130 }} value="1">Standard</Radio.Button>
                <Radio.Button style={{ width: 130 }} value="2">German Daisy</Radio.Button>
                <Radio.Button style={{ width: 130 }} value="3">Belgian Daisy</Radio.Button>
              </Radio.Group>
            </div>

            <div style={{ margin: 20 }}>
              <h3>Game Type</h3>
              <Radio.Group value={this.state.gameType} onChange={this.handleGameType}>
                <Radio.Button style={{ width: 130 }} value="pvp">PVP</Radio.Button>
                <Radio.Button style={{ width: 130 }} value="pve">PVE</Radio.Button>
                <Radio.Button style={{ width: 130 }} value="eve" disabled>EVE</Radio.Button>
              </Radio.Group>
            </div>

            {this.state.gameType === "pve" ?
              <div style={{ margin: 20 }}>
                <h3>Player Color Selection</h3>
                <Radio.Group value={this.state.playerColor} onChange={this.handleColorSelection}>
                  <Radio.Button style={{ width: 130 }} value="white">White</Radio.Button>
                  <Radio.Button style={{ width: 130 }} value="black">Black</Radio.Button>
                </Radio.Group>
              </div> : null}


            <div style={{ margin: 20 }}>
              <h3>Move limit per player per game</h3>

              <InputNumber min={1} max={100} defaultValue={40} onChange={this.handleMoveLimit} />
            </div>

            <div style={{ margin: 20 }}>
              <h3>Time limit per move</h3>

              <InputNumber min={1} max={1000} defaultValue={10} onChange={this.handleTimeLimit} />
            </div>

            <div style={{ margin: 20 }}>
              <Button type="primary" block onClick={this.startGame}>Good Luck, have fun! </Button>
            </div>

          </div>
        </Drawer>
      </div>
    );
  }
}

export default App;
