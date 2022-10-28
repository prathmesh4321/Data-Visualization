var expanded = false;
var regions_map = new Map();
var country_region_map = new Map();
var checkbox_region_list = [];
var selected_attribute = 'Data.Health.Birth Rate';
var countriesData;
var plot_svg;
var margin;
var width;
var height;
var svg;
var opacity_global = 1;

document.addEventListener('DOMContentLoaded', function () {

	margin = {top: 10, right: 150, bottom: 60, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

	svg = d3.select("#my_dataviz")
  	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
  	.append("g")
    	.attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

	readData();

	var input_slider_year = document.getElementById('css_slider');
	var input_year = document.getElementById('slider_value');
	
	input_year.oninput = function () {
		input_slider_year.value = input_year.value;
		plot_data();
	};

	input_slider_year.oninput = function () {
		input_year.value = input_slider_year.value;
		plot_data();
	};

});

async function readData() {
await Promise.all([d3.csv('data/countries_regions.csv'), d3.csv('data/global_development.csv')])
		.then(function (values) {
			regionData = values[0];
			for(let i=0;i<regionData.length;i++){
					
				if(regions_map.has(regionData[i]['World bank region'])){
					regions_map.get(regionData[i]['World bank region']).push(regionData[i]['name']);	
				}
				else{
					regions_map.set(regionData[i]['World bank region'], [regionData[i]['name']]);	
				}
			}

			for(let i=0;i<regionData.length;i++){
					
				country_region_map.set(regionData[i]['name'], regionData[i]['World bank region']);	
				
			}

			countriesData = values[1];
			
		})

}


function global_indicator(y_attribute){

	selected_attribute = y_attribute;
	console.log(y_attribute);

}



function plot_data(){

	svg.selectAll('circle').remove();
	svg.selectAll('text').remove();
	svg.selectAll('path').remove();

	var countries_list = [];

	for(let i=0;i<checkbox_region_list.length;i++){

		countries_list = countries_list.concat(regions_map.get(checkbox_region_list[i]));
	}

	//console.log(countries_list);
	//console.log(countriesData);

	var countries_map = new Map();
	

	for(let i=0;i<countries_list.length;i++){
		for(let j=0;j<countriesData.length;j++){

			if(countries_list[i] == countriesData[j]['Country']){

				if(countries_map.has(countries_list[i])){
					countries_map.get(countries_list[i]).push(parseFloat(countriesData[j][selected_attribute]));
				}
				else{
					countries_map.set(countries_list[i], [parseFloat( countriesData[j][selected_attribute])]);
				}

			}

		}
	}

	// countriesDataFiltered
	var countriesDataFiltered = [];
	let k = 0;
	for(let i=0;i<countries_list.length;i++){
		for(let j=0;j<countriesData.length;j++){

			if(countries_list[i] == countriesData[j]['Country']){

				countriesDataFiltered[k] = {
					Year: parseInt(countriesData[j]['Year']),
					Country: countriesData[j]['Country'],
					attribute_value: parseFloat(countriesData[j][selected_attribute]),
					region: country_region_map.get(countriesData[j]['Country'])
				};
				k++;
			}

		}
	}
	
	//console.log(countriesDataFiltered);

	var y_max = Number.MIN_VALUE;
	var y_min = Number.MAX_VALUE;
	for (const key of countries_map.keys()) {
  		//console.log(key, countries_map.get(key)); 
  		for(var i=0;i<countries_map.get(key).length;i++){
  			if(countries_map.get(key)[i]>y_max){
  				y_max = countries_map.get(key)[i]
  			}
  		}

  	}

  	//console.log(y_max);

	var parseTime = d3.timeParse("%Y");

	countriesDataFiltered.forEach(function (d) {
    	d.Year = parseTime(d.Year);
	});



	var xExtent = d3.extent(countriesDataFiltered, d => d.Year);
  	var x_axis = d3.scaleTime().domain(xExtent).range([0, width]);

	var y_axis = d3.scaleLinear().domain([0, y_max]).nice().range([height, 0]);

	svg.select('#x_axis').remove();
	svg.select('#x_label').remove();
  	svg.append("g")
			.attr("id", "x_axis")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(900)
			.ease(d3.easeLinear)
			.call(d3.axisBottom(x_axis));

	svg.append("text")
		.attr("id", "x_label")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom-10) + ")")
        .style("text-anchor", "middle")
        .text("Year");

	svg.select('#y_axis').remove();
	svg.select('#y_label').remove();
	svg.append("g")
			.attr("id", "y_axis")
			//.style("transform", "translate(100px,40px)")
			.transition()
			.duration(900)
			.ease(d3.easeLinear)
			.call(d3.axisLeft(y_axis)
				.ticks(10)
				.tickFormat(d3.format("d")));

    svg.append("text")
    .attr("id", "y_label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(selected_attribute);


	//console.log(countriesDataFiltered);

	var grouped_data = d3.nest() 
    .key(d => d.Country)
    .entries(countriesDataFiltered);

    console.log(grouped_data);


    var color = ["gold", "blue", "orange", "red", "#9467BDFF", "grey", "darkgreen"]
    
    var region_num = new Map();

    region_num.set('South Asia', 0); region_num.set('Europe & Central Asia', 1);  region_num.set('Latin America & Caribbean', 2); region_num.set('East Asia & Pacific', 3); region_num.set('Sub-Saharan Africa', 4);
    region_num.set('Middle East & North Africa', 5); region_num.set('North America', 6);
	

	svg.selectAll(".line")
	    .attr("class", "line")
	    .attr("id", "line_plot")
	    .data(grouped_data)
	    .enter()
	    .append("path")
	    .on('mouseover', function(i, d){
	    	d3.selectAll('path')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', 0.2);

	    	d3.select(this).transition()
	    		.duration('60')
	    		.style('opacity', 2)
	    		.attr("stroke-width", 2);

	    })
	    .on('mouseout', function(i, d){
	    	d3.selectAll('path').transition()
	    	.duration(60)
	    	.style('opacity', opacity_global);

	    	d3.select(this).transition()
	    		.duration('60')
	    		.attr("stroke-width", 2)
	    		.style('opacity', opacity_global);
	    })
	    .transition()
		.duration(900)
		.ease(d3.easeLinear)
	    .attr("d", function (d) {
	        return d3.line()
	            .x(d => x_axis(d.Year))
	            .y(d => y_axis(d.attribute_value)).curve(d3.curveCardinal)
	            (d.values)
	    })
	    .attr("fill", "none")
	    .attr("stroke", function(d){
	    	//console.log(d.values[0].region)
	    	return color[region_num.get(d.values[0].region)]
	    })
	    .attr("stroke-width", 2)
	
	svg
    .selectAll('circle')
    .data(grouped_data)
    .enter()
    .append('circle')
    .on('mouseover', function(i, d){
	    	d3.selectAll('circle')
	    	.transition().duration(60)
	    	.style('opacity', 0.2);

	    	d3.select(this)
	    	.transition().duration('60')
	    	.style('opacity', 2)
	    	.attr("stroke-width", 2);
	    	
	    })
    .on('mouseout', function(i, d){
    	d3.selectAll('circle')
    	.transition().duration(60)
    	.style('opacity', opacity_global);

    	d3.select(this)
    	.transition().duration('60')
    	.attr("stroke-width", 2)
    	.style('opacity', opacity_global);
    })
    .transition()
	.duration(900)
	.ease(d3.easeLinear)
    .attr('cx', function(d){
 			return x_axis(d.values[33].Year) 
 		})
    .attr('cy', function(d){
 			//console.log(d.values[33].attribute_value)
 			return y_axis(d.values[33].attribute_value)
 		})
    .attr('r', 8)
    .attr("stroke", "black")
    .style('fill', function(d){
    	//console.log(color[region_num.get(d.values[0].region)])
	    return color[region_num.get(d.values[0].region)]
	 });

 	svg.selectAll('text.label')
 		.data(grouped_data)
 		.enter()
 		.append('text')
 		.on('mouseover', function(i, d){
	    	d3.selectAll('text')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', 0.2);
	    	
	    	d3.select(this)
	    	.transition().duration('60')
	    	.style('opacity', 2)
	    	.attr("stroke-width", 2);

	    })
	    .on('mouseout', function(i, d){
	    	d3.selectAll('text')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', opacity_global);

	    	d3.select(this)
	    	.transition()
	    	.duration('60')
	    	.attr("stroke-width", 2)
	    	.style('opacity', opacity_global);
	    })
 		.text(d=>d.key)
 		.attr('x', function(d){
 			return x_axis(d.values[33].Year) 
 		})
 		.attr('y', function(d){
 			//console.log(d.values[33].attribute_value)
 			return y_axis(d.values[33].attribute_value)
 		})
 		.transition()
		.duration(900)
		.ease(d3.easeLinear)
 		.attr('alignment-baseline', 'middle')
 		.attr('dx', 8)
 		.attr('font-size', 12)
 		.attr("stroke", function(d){
	    	return color[region_num.get(d.values[0].region)]
	    })
 		.attr('dy', function(d){
 			if(d.key === 'Afghanistan' || d.key === 'United States' || d.key === 'Canada' || d.key === 'India' || d.key === 'Bangladesh' || d.key === 'Pakistan'|| d.key === 'Sri Lanka'){
 				return 5
 			}
 			else{
 				return 0
 			}

 		})


	d3.select("#range1").on("input", function () {	

		opacity_global = d3.select("#range1").property("value")/90

		svg.selectAll('path')
			.style("opacity", d3.select("#range1").property("value")/90)
		svg.selectAll('text')
			.style("opacity", d3.select("#range1").property("value")/90)
		svg.selectAll('circle')
			.style("opacity", d3.select("#range1").property("value")/90)
	});


}

function Animation(){
	
	svg.selectAll('circle').remove();
	svg.selectAll('text').remove();
	svg.selectAll('path').remove();

	var countries_list = [];

	for(let i=0;i<checkbox_region_list.length;i++){

		countries_list = countries_list.concat(regions_map.get(checkbox_region_list[i]));
	}

	var countries_map = new Map();
	
	for(let i=0;i<countries_list.length;i++){
		for(let j=0;j<countriesData.length;j++){

			if(countries_list[i] == countriesData[j]['Country']){

				if(countries_map.has(countries_list[i])){
					countries_map.get(countries_list[i]).push(parseFloat(countriesData[j][selected_attribute]));
				}
				else{
					countries_map.set(countries_list[i], [parseFloat( countriesData[j][selected_attribute])]);
				}

			}

		}
	}

	// countriesDataFiltered
	var countriesDataFiltered = [];
	let k = 0;
	for(let i=0;i<countries_list.length;i++){
		for(let j=0;j<countriesData.length;j++){

			if(countries_list[i] == countriesData[j]['Country']){

				countriesDataFiltered[k] = {
					Year: parseInt(countriesData[j]['Year']),
					Country: countriesData[j]['Country'],
					attribute_value: parseFloat(countriesData[j][selected_attribute]),
					region: country_region_map.get(countriesData[j]['Country'])
				};
				k++;
			}

		}
	}
	
	//console.log(countriesDataFiltered);

	var y_max = Number.MIN_VALUE;
	var y_min = Number.MAX_VALUE;
	for (const key of countries_map.keys()) {
  		//console.log(key, countries_map.get(key)); 
  		for(var i=0;i<countries_map.get(key).length;i++){
  			if(countries_map.get(key)[i]>y_max){
  				y_max = countries_map.get(key)[i]
  			}
  		}

  	}

  	//console.log(y_max);

	var parseTime = d3.timeParse("%Y");

	countriesDataFiltered.forEach(function (d) {
    	d.Year = parseTime(d.Year);
	});



	var xExtent = d3.extent(countriesDataFiltered, d => d.Year);
  	var x_axis = d3.scaleTime().domain(xExtent).range([0, width]);

	var y_axis = d3.scaleLinear().domain([0, y_max]).nice().range([height, 0]);

	svg.select('#x_axis').remove();
	svg.select('#x_label').remove();
  	svg.append("g")
			.attr("id", "x_axis")
			.attr("transform", "translate(0," + height + ")")
			.transition()
			.duration(15000)
			.ease(d3.easeLinear)
			.call(d3.axisBottom(x_axis));

	svg.append("text")
		.attr("id", "x_label")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom-10) + ")")
        .style("text-anchor", "middle")
        .text("Year");

	svg.select('#y_axis').remove();
	svg.select('#y_label').remove();
	svg.append("g")
			.attr("id", "y_axis")
			//.style("transform", "translate(100px,40px)")
			.transition()
			.duration(15000)
			.ease(d3.easeLinear)
			.call(d3.axisLeft(y_axis)
				.ticks(10)
				.tickFormat(d3.format("d")));

    svg.append("text")
    .attr("id", "y_label")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(selected_attribute);


	//console.log(countriesDataFiltered);

	var grouped_data = d3.nest() 
    .key(d => d.Country)
    .entries(countriesDataFiltered);

    console.log(grouped_data);


    var color = ["gold", "blue", "orange", "red", "#9467BDFF", "grey", "darkgreen"]
    
    var region_num = new Map();

    region_num.set('South Asia', 0); region_num.set('Europe & Central Asia', 1);  region_num.set('Latin America & Caribbean', 2); region_num.set('East Asia & Pacific', 3); region_num.set('Sub-Saharan Africa', 4);
    region_num.set('Middle East & North Africa', 5); region_num.set('North America', 6);
	

	svg.selectAll(".line")
	    .attr("class", "line")
	    .data(grouped_data)
	    .enter()
	    .append("path")
	    .attr("id", function(d,i){
	    	return "line" + i;
	    })
	    .on('mouseover', function(i, d){
	    	d3.selectAll('path')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', 0.2);

	    	d3.select(this).transition()
	    		.duration('60')
	    		.style('opacity', 2)
	    		.attr("stroke-width", 2);

	    })
	    .on('mouseout', function(i, d){
	    	d3.selectAll('path').transition()
	    	.duration(60)
	    	.style('opacity', opacity_global);

	    	d3.select(this).transition()
	    		.duration('60')
	    		.attr("stroke-width", 2)
	    		.style('opacity', opacity_global);
	    })
	    .transition()
		.duration(15000)
		.ease(d3.easeLinear)
	    .attr("d", function (d) {
	        return d3.line()
	            .x(d => x_axis(d.Year))
	            .y(d => y_axis(d.attribute_value)).curve(d3.curveCardinal)
	            (d.values)
	    })
	    .attr("fill", "none")
	    .attr("stroke", function(d){
	    	//console.log(d.values[0].region)
	    	return color[region_num.get(d.values[0].region)]
	    })
	    .attr("stroke-width", 2)
	
	svg
    .selectAll('circle')
    .data(grouped_data)
    .enter()
    .append('circle')
    .on('mouseover', function(i, d){
	    	d3.selectAll('circle')
	    	.transition().duration(60)
	    	.style('opacity', 0.2);

	    	d3.select(this)
	    	.transition().duration('60')
	    	.style('opacity', 2)
	    	.attr("stroke-width", 2);
	    	
	    })
    .on('mouseout', function(i, d){
    	d3.selectAll('circle')
    	.transition().duration(60)
    	.style('opacity', opacity_global);

    	d3.select(this)
    	.transition().duration('60')
    	.attr("stroke-width", 2)
    	.style('opacity', opacity_global);
    })
    .transition()
	.duration(15000)
	.ease(d3.easeLinear)
    .attr('cx', function(d){
 			return x_axis(d.values[33].Year) 
 		})
    .attr('cy', function(d){
 			//console.log(d.values[33].attribute_value)
 			return y_axis(d.values[33].attribute_value)
 		})
    .attr('r', 8)
    .attr("stroke", "black")
    .style('fill', function(d){
    	//console.log(color[region_num.get(d.values[0].region)])
	    return color[region_num.get(d.values[0].region)]
	 });

 	svg.selectAll('text.label')
 		.data(grouped_data)
 		.enter()
 		.append('text')
 		.on('mouseover', function(i, d){
	    	d3.selectAll('text')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', 0.2);
	    	
	    	d3.select(this)
	    	.transition().duration('60')
	    	.style('opacity', 2)
	    	.attr("stroke-width", 2);

	    })
	    .on('mouseout', function(i, d){
	    	d3.selectAll('text')
	    	.transition()
	    	.duration(60)
	    	.style('opacity', opacity_global);

	    	d3.select(this)
	    	.transition()
	    	.duration('60')
	    	.attr("stroke-width", 2)
	    	.style('opacity', opacity_global);
	    })
 		.text(d=>d.key)
 		.attr('x', function(d){
 			return x_axis(d.values[33].Year) 
 		})
 		.attr('y', function(d){
 			//console.log(d.values[33].attribute_value)
 			return y_axis(d.values[33].attribute_value)
 		})
 		.transition()
		.duration(15000)
		.ease(d3.easeLinear)
 		.attr('alignment-baseline', 'middle')
 		.attr('dx', 8)
 		.attr('font-size', 12)
 		.attr("stroke", function(d){
	    	return color[region_num.get(d.values[0].region)]
	    })
 		.attr('dy', function(d){
 			if(d.key === 'Afghanistan' || d.key === 'United States' || d.key === 'Canada' || d.key === 'India' || d.key === 'Bangladesh' || d.key === 'Pakistan'|| d.key === 'Sri Lanka'){
 				return 5
 			}
 			else{
 				return 0
 			}

 		})



	d3.select("#range1").on("input", function () {	

		opacity_global = d3.select("#range1").property("value")/90

		svg.selectAll('path')
			.style("opacity", d3.select("#range1").property("value")/90)
		svg.selectAll('text')
			.style("opacity", d3.select("#range1").property("value")/90)
		svg.selectAll('circle')
			.style("opacity", d3.select("#range1").property("value")/90)
	});

}


function showCheckboxes() {

    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }

    var check = document.querySelectorAll('.checkbox');

    for(var checkbox of check){
    	checkbox.addEventListener('click', function(){
    		if(this.checked == true){
    			checkbox_region_list.push(this.value);
    		}
    		else{
    			checkbox_region_list = checkbox_region_list.filter(e => e !== this.value);
    		}
    	})
    }

}