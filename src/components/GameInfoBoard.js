import React, { Component } from 'react';
import { Timeline, Statistic, Card, Row, Col, Icon } from 'antd';

export default class GameInfoBoard extends Component {

  //color white 1, black 2
  getTimer = (color) => {
    let timer = 0;
    if(color === 1) {
      if(this.props.gameInfo.turn % 2 === 0) {
        timer = this.props.gameInfo.timeLeft 
      } 
    } else {
      if(this.props.gameInfo.turn % 2 === 1) {
        timer = this.props.gameInfo.timeLeft 
      } 
    }
    return Math.round(timer * 100) / 100;
  }
  render() {
    const whiteBkStyle = (this.props.gameInfo.turn % 2 === 0) ? {} : {backgroundColor: "#bdbdbd"};
    const blackBkStyle = (this.props.gameInfo.turn % 2 === 1) ? {} : {backgroundColor: "#bdbdbd"};

    const whiteTimelineStyle = (this.props.gameInfo.turn % 2 === 0) ? {minHeight: 550} : {backgroundColor: "#bdbdbd", minHeight: 550};
    const blackTimelineStyle = (this.props.gameInfo.turn % 2 === 1) ? {minHeight: 550} : {backgroundColor: "#bdbdbd", minHeight: 550};
    const turnSuffix = `/ ${this.props.gameInfo.moveLimit}`;
    return (
      <div style={{ maxHeight: 600 }}>
        
        <Row>
          <div style={{ margin: 20, float: "right" }}>
            <Statistic value={Math.round(this.props.gameInfo.turn/2)} prefix="Turn: " suffix={turnSuffix} valueStyle={{ fontSize: 40, color: "#fafafa" }}/>
          </div>
        </Row>

        <Row gutter={16}>
          
          <Col span={12}>
            <Card style={blackBkStyle} >
              <Row>
                <Col span={12}>
                  <Statistic
                    title="Black Player"
                    value={1}
                    precision={0}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<Icon type="frown" />}
                  />
                </Col>

                <Col span={12}>
                  <Statistic title="Time" value={this.getTimer(2)} suffix=" s" />
                </Col>
              </Row>
            </Card>

            <Card style={blackTimelineStyle}>
              <Timeline>
                <Timeline.Item>Move A1 to right - 2s</Timeline.Item>
                <Timeline.Item>Move B3 to top left - 5s</Timeline.Item>
                <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left - 10s</Timeline.Item>
                <Timeline.Item>Move D3 C3 to left - 8s</Timeline.Item>
                <Timeline.Item>Move A1 to right - 2s</Timeline.Item>
                <Timeline.Item>Move B3 to top left - 5s</Timeline.Item>
                <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left - 10s</Timeline.Item>
                <Timeline.Item>Move D3 C3 to left - 8s</Timeline.Item>
              </Timeline>
            </Card>

          </Col>

          <Col span={12} >
            <Card style={whiteBkStyle}>
              <Row>
                <Col span={12}>
                  <Statistic
                    title="White Player"
                    value={3}
                    precision={0}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<Icon type="smile" />}
                  />
                </Col>

                <Col span={12} >
                  <Statistic title="Time" value={this.getTimer(1)} suffix=" s" />
                </Col>
              </Row>
            </Card>

            <Card style={whiteTimelineStyle}>
              <Timeline >
                <Timeline.Item>Move A1 to right - 3s</Timeline.Item>
                <Timeline.Item>Move B3 to top left - 5s</Timeline.Item>
                <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left - 10s</Timeline.Item>
                <Timeline.Item>Move A1 to right - 3s</Timeline.Item>
                <Timeline.Item>Move B3 to top left - 5s</Timeline.Item>
                <Timeline.Item>Move D4 C4 B4 and push E4 F4 to top left - 10s</Timeline.Item>
              </Timeline>
            </Card>

          </Col>
        </Row>
      </div>

    )
  }
}
