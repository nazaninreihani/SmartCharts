import React, { Component } from 'react';
import { connect } from '../store/Connect';
import ChartTypes from './ChartTypes.jsx';
import StudyLegend from './StudyLegend.jsx';
import Comparison from './Comparison.jsx';
import Views from './Views.jsx';
import CrosshairToggle from './CrosshairToggle.jsx';
import Timeperiod from './Timeperiod.jsx';
import ChartSize from './ChartSize.jsx';
import DrawTools from './DrawTools.jsx';
import ChartSetting from './ChartSetting.jsx';
import Share from './Share.jsx';

const ChartControls = ({
    isMobile
}) => (
    <div className="cq-chart-controls">
        {isMobile ? '' : <CrosshairToggle />}
        <ChartTypes />
        <StudyLegend />
        <Comparison />
        <DrawTools />
        <Views />
        <Share />
        <Timeperiod />
        <ChartSize />
        <ChartSetting />
    </div>
);

export default connect(
    ({chart}) => ({
        isMobile: chart.isMobile
    })
)(ChartControls);