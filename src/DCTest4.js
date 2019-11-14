import React from 'react';
import dc from 'dc';
import crossfilter from 'crossfilter2';
import * as d3 from 'd3/dist/d3';
import "dc/dc.css";
import './App.css'; // ray: default table without any styling looks ugly. Addded some table styles.

// to test the bubbleoverlay function
// depends on the outside API written for return KPI values
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
        // Parse to get the area. Format: //PLANT/Area_{0:D2}/{1}
        var toks = data.fullPath.split('/')
        let area = toks[3]; // todo, unsafe                
        return area;
    })
    .size(100); // will degarde performance if we show too many

    //return nasdaqTable;
    nasdaqTable.render();
}

// Draws the bubble on top of static image
const drawImageMap = (divRef, dimension, group) => {
    // [1] Load the background image first
    var svg = d3.select('#bgImage');
    var myImage = svg.append('image')
    .attr('xlink:href', '../singapore_Map.jpg')
    .attr('width', 500)
    .attr('height', 322);


    // [2] Take care of the bubbleoverlay control
    // As per documentation, need to pass an empty svg element if the imageElement is a static image
    var svg2 = d3.select('#myImageMap');
    var myImage2 = svg2
    .attr('width', 500)
    .attr('height', 322);


    var imgChart = dc.bubbleOverlay(divRef)
    .svg(myImage2)
    .width(500)
    .height(322)
    .dimension(dimension)
    .group(group)
    .radiusValueAccessor(function(p) {
        return p.value;
    })
    // ray: 8000 should be adjusted based on the values of the radius data
    // if incorrect, the radius can become either all the same, or all very big
    .r(d3.scaleLinear().domain([0, 8000]))
    .colors(["#ff7373","#ff4040","#ff0000","#bf3030","#a60000"])
    // Adjust this also so that the colors would be lighter or darker
    .colorDomain([0, 2000])
    .colorAccessor(function(p) {
        return p.value;
    })
    .point("Area_00", 250, 150)
    .point("Area_01", 100, 100)
    .point("Area_02", 300, 110)
    .point("Area_03", 460, 65)
    .point("Area_04", 170, 150)
    .point("Area_05", 40, 150)
    .point("Area_06", 423, 120)
    .point("Area_07", 200, 50)
    .point("Area_08", 222, 90)
    .point("Area_09", 335, 140)
    .render();
}


class DCTest3 extends React.Component {

    constructor(props) {
        super(props);
        this.myRefChart = React.createRef();
        this.myRefTable = React.createRef();
        this.myRefImageMap = React.createRef();
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

            // [1.1] Area Dimension
            const dimensionArea = kpis.dimension(function (data) {
                // Parse to get the area. Format: //PLANT/Area_{0:D2}/{1}
                var toks = data.fullPath.split('/')
                let area = toks[3]; // todo, unsafe                
                return area;
            });
            const groupArea = dimensionArea.group();

            // [1.2] KPI Dimension

            const dimensionKpi = kpis.dimension(function (data) {
                return data.kpiStatus;
            });
            const groupKpi = dimensionKpi.group();

            // For the image map            
            drawImageMap(me.myRefImageMap.current, dimensionArea, groupArea);

            // For the RowChart
            const kpiStatusChart = dc.rowChart(me.myRefChart.current)

            kpiStatusChart
                .dimension(dimensionKpi)
                .group(groupKpi)    
                .ordinalColors(['#00aa00', '#aa2222', '#999900', '#555555'])            
                .render();

            // // For the table
            drawTable(me.myRefTable.current, kpis);
        });        
    }

    render() {
        return <div>
            <h3>KPI Status Summary</h3>
            {/* The background image should be an svg element inside the main imagemap */}
            <svg id="myImageMap" width="500px" height="322" ref={this.myRefImageMap}>                
                <svg id="bgImage" width="500px" height="322" ></svg>
            </svg>
            
            <div id="myPieChartId" ref={this.myRefChart}/>
            <div id="myTableId" ref={this.myRefTable}/>
        </div>
    }
}

export default DCTest3