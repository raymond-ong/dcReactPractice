import React from 'react';
import dc from 'dc';
import crossfilter from 'crossfilter2';
import * as d3 from 'd3/dist/d3';
import "dc/dc.css";
import './App.css'; // ray: default table without any styling looks ugly. Addded some table styles.


// Simple Pie chart and table using DC
// When the user clicks on the wedge of the pie chart, the table under it will be filtered

const drawPieChart = (refDiv, dim, dimGroup) => {
    var oldOrYoungChart = dc.pieChart(refDiv);
    oldOrYoungChart
    .width(180)
    .height(180)
    .radius(80)
    .dimension(dim)
    .group(dimGroup)
    .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
    .colorDomain([-1750, 1644])
    .colorAccessor(function(d, i){return d.value;})
    .render();
}


const drawTable = (divRef, ndx) => {
    const nasdaqTable = dc.dataTable(divRef);

    const dimension = ndx.dimension(d=> d.dd);
    nasdaqTable.dimension(dimension)
    .columns([
      'id',
      'employee_name',
      'employee_salary',
      'employee_age'
    ])
    .sortBy(function (d) {
        let nAge = parseInt(d.employee_age)
        return nAge;
    })
    .on('renderlet', function (table) {
        table.selectAll('.dc-table-group').classed('info', true);
    })
    .size(100000);

    //return nasdaqTable;
    nasdaqTable.render();

}

class DCTest2 extends React.Component {

    constructor(props) {
        super(props);
        this.myRefPie = React.createRef();
        this.myRefTable = React.createRef();
    }

    componentDidMount = () => {
        var me = this;
        console.log('componentDidMount...');
        d3.json('http://dummy.restapiexample.com/api/v1/employees').then(function(data) {
            // Sample data from API
            // {"id":"1","employee_name":"Res hh","employee_salary":"85146","employee_age":"73","profile_image":""}

            // [1] Prepare data
            console.log('gotten data', data.length);
            var employees = crossfilter(data);
            var empCount = employees.groupAll().reduceCount().value();
            const all = employees.groupAll();
            console.log('employee count: ', empCount);

            var oldOrYoung = employees.dimension(function (d) {
                return d.employee_age > 50 ? 'Old' : 'Young';
            });

            var oldOrYoungGroup = oldOrYoung.group();

            // [2] Draw Pie Chart
            drawPieChart(me.myRefPie.current, oldOrYoung, oldOrYoungGroup);

            // [3] Draw table
            drawTable(me.myRefTable.current, employees);
        });        
    }

    render() {
        return <div>
            <h3>Employee Summary</h3>
            <div id="myPieChartId" ref={this.myRefPie}/>
            <div id="myTableId" ref={this.myRefTable}/>
        </div>
    }
}

export default DCTest2