import React from 'react';
import dc from 'dc';
import crossfilter from 'crossfilter2';
import * as d3 from 'd3/dist/d3';
import "dc/dc.css";
import './App.css'; // ray: default table without any styling looks ugly. Addded some table styles.

const drawTable = (divRef, ndx) => {
    const nasdaqTable = dc.dataTable(divRef);

    const dimension = ndx.dimension(d=> d.dd);
    nasdaqTable.dimension(dimension)
    .columns([
      'targetName',
      'diagnosticName',
      'fullPath',
      'kpiName',
      'kpiStatus',
      'kpiValue'
    ])
    .on('renderlet', function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
    })
    .group(function (data) {
        return data.kpiStatus
    })
    .size(100000);

    //return nasdaqTable;
    nasdaqTable.render();

}


class DCTest3 extends React.Component {

    constructor(props) {
        super(props);
        this.myRefChart = React.createRef();
        this.myRefTable = React.createRef();
    }

    componentDidMount = () => {
        var me = this;
        console.log('componentDidMount...');
        d3.json('http://localhost:60000/api/kpi').then(function(data) {
            // Sample data from API
            // {"id":"1","employee_name":"Res hh","employee_salary":"85146","employee_age":"73","profile_image":""}

            // [1] Prepare data
            console.log('gotten data', data.length);
            var kpis = crossfilter(data);
            var kpiCount = kpis.groupAll().reduceCount().value();
            const all = kpis.groupAll();
            console.log('employee count: ', kpiCount);

            const kpiStatusChart = dc.rowChart(me.myRefChart.current)
            const dimension = kpis.dimension(function (data) {
                return data.kpiStatus;
            });
            const group = dimension.group()
            kpiStatusChart
                .dimension(dimension)
                .group(group)
                .ordinalColors(['#00aa00', '#aa2222', '#999900', '#555555'])
                .render();

            drawTable(me.myRefTable.current, kpis);
        });        
    }

    render() {
        return <div>
            <h3>KPI Status Summary</h3>
            <div id="myPieChartId" ref={this.myRefChart}/>
            <div id="myTableId" ref={this.myRefTable}/>
        </div>
    }
}

export default DCTest3