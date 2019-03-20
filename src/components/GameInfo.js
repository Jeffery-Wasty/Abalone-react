import React, { Component } from 'react';
import { Timeline, Statistic, Card, Row, Col, Icon } from 'antd';

const Countdown = Statistic.Countdown;
const deadline = Date.now() + 1000 * 10;
export default class GameInfo extends Component {
  render() {
    return (

      <div style={{maxHeight: 600}}>
        <Row gutter={16}>
          <Col span={12}>
            <Card>
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

                <Col span={12}>
                  <Countdown title="Time" value={deadline} format="ss:SSS" />
                </Col>
              </Row>
            </Card>

            <Card>
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
          <Col span={12}>
            <Card>
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
                  <Countdown title="Time" value={Date.now()} format="ss:SSS" />
                </Col>
              </Row>
            </Card>

            <Card>
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
        </Row>
      </div>        

    )
  }
}
