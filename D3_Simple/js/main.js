// Hint: This is a good place to declare your global variables
var svg;
var group;
var width = 1000;
var height = 600;
var wrangled_female_data = [];
var wrangled_male_data = [];
var xScale;
var yScale; 
var x_axis;
var y_axis;

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
   svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("height", height)
        .attr("width", width);
        
    
   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('data/females_data.csv'),d3.csv('data/males_data.csv')])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];

            // Hint: This is a good spot for doing data wrangling
            male_data.forEach((ele, idx) => {
                wrangled_male_data[idx] = {
                    Australia: parseFloat(ele.Australia), Germany: parseFloat(ele.Germany), India: parseFloat(ele.India), 
                    Italy: parseFloat(ele.Italy), Russia: parseFloat(ele.Russia), Year: new Date(ele.Year).getFullYear(),
                };
            });

            //console.log(wrangled_male_data);

            female_data.forEach((ele, idx) => {
                wrangled_female_data[idx] = {
                    Australia: parseFloat(ele.Australia), Germany: parseFloat(ele.Germany), India: parseFloat(ele.India), Italy: parseFloat(ele.Italy),
                    Russia: parseFloat(ele.Russia), Year: new Date(ele.Year).getFullYear(),
                };
            });

            //console.log(wrangled_female_data);        

            group = svg.append("g")
                        .attr("transform", "translate(75,25)");

            group1 = svg.append("g")
                        .attr("transform", "translate(60,25)");

            group2 = svg.append("g")
                        .attr("transform", "translate(100,25)");


            group.append("text").attr("x", 800).attr("y", 75).text("Male Employment Rate")
                .attr('stroke', 'Grey').style("text-anchor", "middle");
                

            group.append("rect").attr("x", 690).attr("y", 58).attr("width", 22)
                .attr("height", 22).attr("fill", "Red").attr('opacity', 0.5);

           
            group.append("rect").attr("x", 690).attr("y", 18).attr("width", 22)
                .attr("height", 22).attr("fill", "Blue").attr('opacity', 0.5);

            group.append("text").attr("x", 810).attr("y", 35)
                .text("Female Employment Rate").attr('stroke', 'Grey').style("text-anchor", "middle");
                

            group2.append("text").attr("x", 460).attr("y", 575)
                .style("text-anchor", "middle").text("Years");

            group1.append("text").attr("x", -303).attr("y", -45)
                .text("Employment Rate").style("transform", "rotate(-90deg)");

            x_axis = svg
                .append("g")
                .attr("transform", "translate(50, 575)");
            y_axis = svg
                .append("g")
                .attr("transform", "translate(50, 25)");    

            drawLolliPopChart("Australia");
        });
});

// Use this function to draw the lollipop chart.
function drawLolliPopChart(Country) {
    console.log('trace:drawLollipopChart()');

    var male_max = d3.max(wrangled_male_data, (d) => { return +d[Country] })
    var female_max = d3.max(wrangled_female_data, (d) => { return +d[Country] })

    var data_max = 0;

    if(male_max > female_max){
        data_max = male_max;
    }
    else{
        data_max = female_max;
    }

    xScale = d3.scaleTime()
            .domain([new Date(d3.min(wrangled_female_data, d => d.Year)), new Date(d3.max(wrangled_female_data, d => d.Year)+2)])
            .range([0, 900]);
    yScale = d3.scaleLinear()
            .domain([0, data_max])
            .range([550, 0]);

    var x = d3.axisBottom(xScale);

    x_axis.call(x.tickFormat(d3.format("d")));

    var y = d3.axisLeft(yScale);

    y_axis.call(y);

    var circle_male = group.selectAll(".circle_male").data(wrangled_male_data)

    var circle_female = group.selectAll(".circle_female")
        .data(wrangled_female_data)

    var plot_male = group.selectAll(".plot_male").data(wrangled_male_data)

    var plot_female = group.selectAll(".plot_female")
        .data(wrangled_female_data)

    plot_male.enter().append("line").merge(plot_male).attr("class", "plot_male").transition().duration(800)
        .attr("transform", "translate(-5)").attr("y1", yScale(0)).attr("y2", (d) => { return yScale(d[Country]); })
        .attr("x1", (d) => { return xScale(d.Year); }).attr("x2", (d) => { return xScale(d.Year); }).attr("stroke", "Red");
 

    circle_male.enter().append("circle").merge(circle_male).attr("class", "circle_male").transition().duration(800).attr("transform", "translate(-5)").attr("cx", (d) => { return xScale(d.Year); })
        .attr("cy", (d) => { return yScale(d[Country]); }).attr("r", 7).attr("fill", "Red");


    plot_female.enter().append("line").merge(plot_female).attr("class", "plot_female").attr("transform", "translate(5)").transition()
        .duration(800).attr("x1", (d) => { return xScale(d.Year); }).attr("x2", (d) => { return xScale(d.Year); })
        .attr("y1", yScale(0)).attr("y2", (d) => { return yScale(d[Country]); })
        .attr("stroke", "Blue");
  

    circle_female.enter().append("circle").merge(circle_female).attr("class", "circle_female").attr("transform", "translate(5)").transition().duration(800)
        .attr("cx", (d) => { return xScale(d.Year); }).attr("cy", (d) => { return yScale(d[Country]); }).attr("r", 7).attr("fill", "Blue");

}

