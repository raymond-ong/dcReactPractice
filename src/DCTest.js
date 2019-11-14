import React from 'react';
import dc from 'dc';
import crossfilter from 'crossfilter2';
import * as d3 from 'd3/dist/d3';

// Simple Pie chart, no click functionality
class DCTest extends React.Component {

    constructor(props) {
        super(props);
        this.myRef = React.createRef();
    }

    componentDidMount = () => {
        var me = this;
        console.log('componentDidMount...');
        d3.json('http://dummy.restapiexample.com/api/v1/employees').then(function(data) {
            console.log('gotten data', data.length);
            var employees = crossfilter(data);
            var empCount = employees.groupAll().reduceCount().value();
            console.log('employee count: ', empCount);

            var oldOrYoung = employees.dimension(function (d) {
                return d.employee_age > 50 ? 'Old' : 'Young';
            });

            var oldOrYoungGroup = oldOrYoung.group();

            var oldOrYoungChart = dc.pieChart(me.myRef.current);
            oldOrYoungChart
            .width(180)
            .height(180)
            .radius(80)
            .dimension(oldOrYoung)
            .group(oldOrYoungGroup)
            .colors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .colorDomain([-1750, 1644])
            .colorAccessor(function(d, i){return d.value;})
            .render();
        });        
    }

    render() {
        return <div>
            <h1>Employees Summary</h1>
            <div id="hello" ref={this.myRef}/>
        </div>
    }
}

export default DCTest