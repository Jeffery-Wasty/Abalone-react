import React, { Component } from 'react';
import { Timeline, Statistic, Card, Row, Col, Icon, Button, Drawer } from 'antd';
import HistoryBoard from './HistoryBoard';

export default class GameInfoBoard extends Component {
  state={
    historyVisible: false
  }

  getTimer = (player) => {
    let timer = 0;
    if (player === 1) {
      if (this.props.gameInfo.turn % 2 === 0) {
        timer = this.props.gameInfo.timeLeft
      }
    } else {
      if (this.props.gameInfo.turn % 2 === 1) {
        timer = this.props.gameInfo.timeLeft
      }
    }
    return Math.round(timer * 100) / 100;
  }

  calculateGameScore = (player) => {
      const numOfMarbles = this.props.gameInfo.curState.filter(color => color === (3 - player)).length;
      return 14 - numOfMarbles;
  }

  getScoreImage = (player) => {
    if(this.calculateGameScore(player) < this.calculateGameScore(3-player)){
      return <Icon type="frown" />;
    } else if(this.calculateGameScore(player) > this.calculateGameScore(3-player)){
      return <Icon type="smile" />;
    } else {
      return null;
    }
  }

  getScoreColor = (player) => {
    if(this.calculateGameScore(player) < this.calculateGameScore(3-player)){
      return '#cf1322';
    } else if(this.calculateGameScore(player) > this.calculateGameScore(3-player)){
      return '#3f8600';
    } else {
      return '#000';
    }
  }

  getPlayerTitle = (player) => {
    const colorString = (player === 1)? "White" : "Black";
    if(this.props.gameInfo.gameType === "pve" && this.props.gameInfo.playerColor !== player){
      return colorString + " - AI"; 
    } else {
      return colorString;
    }
  }

  getPlayerMoveHistory = (player) => {
    let moveHistory = [...this.props.gameInfo.moveHistory];
    moveHistory = moveHistory.filter(history => history.turn % 2 === (player - 1));
    moveHistory.reverse();

    return moveHistory;    
  }

  viewHistory = () => {
    this.setState({
      historyVisible: true,
    });
  }


  closeHistory = () => {
    this.setState({
      historyVisible: false,
    });
  };

  getGameInfoBoardStyle = () => {
    const { turn } = this.props.gameInfo;

    const whiteBkStyle = (turn % 2 === 0) ? {} : { opacity: 0.5 };
    const blackBkStyle = (turn % 2 === 1) ? {} : { opacity: 0.5 };

    const whiteTimelineStyle = (turn % 2 === 0) ? { minHeight: '50vh', maxHeight: '50vh' } :  { opacity: 0.5, minHeight: '50vh', maxHeight: '50vh' };
    const blackTimelineStyle = (turn % 2 === 1) ? { minHeight: '50vh', maxHeight: '50vh' } :  { opacity: 0.5, minHeight: '50vh', maxHeight: '50vh' };

    const blackHeadStyle = {fontSize: 30, fontWeight: "bold", backgroundColor: "#f57c00"};
    const whiteHeadStyle = {fontSize: 30, fontWeight: "bold", backgroundColor: "#f57c00", color: "#fff"};

    return {whiteBkStyle, blackBkStyle, whiteTimelineStyle, blackTimelineStyle, blackHeadStyle, whiteHeadStyle};
  }

  render() {
    const { turn, moveLimit, moveHistory } = this.props.gameInfo;
    const {whiteBkStyle, blackBkStyle, whiteTimelineStyle, blackTimelineStyle, blackHeadStyle, whiteHeadStyle} = this.getGameInfoBoardStyle();

    return (
      <div style={{ maxHeight: 600 }}>

        <Row>
          <div style={{ margin: 30, float: "right" }}>
            <Statistic 
              value={turn} prefix={`Game Turn: `} suffix={` / ${moveLimit * 2}`} 
              valueStyle={{ fontSize: 40, color: "#fff", fontFamily: `"Comic Sans MS", cursive, sans-serif` }} />
          </div>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card style={blackBkStyle} headStyle={blackHeadStyle} title={this.getPlayerTitle(2)} 
                  bordered={false} size="small" >
              <Row>
                <Col span={12}>
                  <Statistic
                    title="Score"
                    value={this.calculateGameScore(2)}
                    valueStyle={{ color: this.getScoreColor(2)}}
                    prefix={this.getScoreImage(2)}
                  />
                </Col>
                <Col span={12}>
                  <Statistic title="Time" value={this.getTimer(2)} suffix=" s" />
                </Col>
              </Row>
            </Card>

            <Card style={blackTimelineStyle}>
                <Timeline>
                  {this.getPlayerMoveHistory(2).slice(0, 10).map((history, key) => {
                      return key === 0 ? <Timeline.Item key={key} color="green">{history.text}</Timeline.Item> :
                                         <Timeline.Item key={key} color="blue">{history.text}</Timeline.Item>
                  })}
                </Timeline>             
            </Card>

          </Col>

          <Col span={12} >
            <Card style={whiteBkStyle} headStyle={whiteHeadStyle} title={this.getPlayerTitle(1)} bordered={false} size="small">
              <Row>
                <Col span={12}>
                  <Statistic
                    title="Score"
                    value={this.calculateGameScore(1)}
                    valueStyle={{ color: this.getScoreColor(1)}}
                    prefix={this.getScoreImage(1)}
                  />
                </Col>

                <Col span={12} >
                  <Statistic title="Time" value={this.getTimer(1)} suffix=" s" />
                </Col>
              </Row>
            </Card>

            <Card style={whiteTimelineStyle}>
              <Timeline>
                {this.getPlayerMoveHistory(1).map((history, key) => {
                      return key === 0 ? <Timeline.Item key={key} color="green">{history.text}</Timeline.Item> :
                                         <Timeline.Item key={key} color="blue">{history.text}</Timeline.Item>
                  })}
              </Timeline>
            </Card>

          </Col>
        </Row>

        <Row>
          <Button style={{float: "right", marginTop: 50 }} 
                  onClick={this.viewHistory} type="dashed" ghost>
                  View Entire History
          </Button>
        </Row>


        <Drawer
          title="History"
          placement="right"
          width={1200}
          onClose={this.closeHistory}
          visible={this.state.historyVisible}  
        >
          <HistoryBoard moveHistory={moveHistory} />
        </Drawer>
        
      </div>

    )
  }
}
