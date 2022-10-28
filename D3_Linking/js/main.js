const vowels = ["a", "e", "i", "o", "u", "y"]
const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "z"]
const punctuations = [".", ",", "?", "!", ":", ";"]
var svg;
var width;
var height;
var margin;
var radius;

function func(element){
		return {
			char: element[0],
			cnt : element[1]
		};
}			

function barchart(bar_data, color){

		var arr = []

		for (var m in bar_data) {
			arr.push([m, bar_data[m]]);
		}


		var plot_data = arr.map(func);


		var margin = {top: 50, right: 5, bottom: 7, left: 30},
		    width = 600 - margin.left - margin.right,
		    height = 400 - margin.top - margin.bottom;


		var x = d3.scaleBand()
				.range([margin.left, width])
				.padding(0.1);

		var y = d3.scaleLinear()
				.range([height-margin.bottom, margin.top]);


		var svg = d3.select('#bar_svg')
					.append('svg')
					.attr("width", width)
					.attr("height", height)
					.attr('viewBox', [0, 0, width, height])
					.style('overflow', 'visible')
					.attr("transform", 
          				"translate(" + margin.left + "," + margin.top + ")");
					

		x.domain(plot_data.map(function(d){ return d.char; }));

		y.domain([0, d3.max(plot_data, function(d){ return d.cnt;})]);

		var div = d3.select("body").select("#bar_div").append("div")
     		.attr("class", "tooltip-bar")
     		.style("opacity", 0);

		svg.append('g')
			.attr('fill', color)
			.selectAll('rect')
			.data(plot_data)
			.join('rect')
			.attr('class', 'rectangle')
			.attr("stroke", "black")
			.style("stroke-width", "1px")
			.attr('x', function(d){return x(d.char);})
			.attr('y', function(d){return y(d.cnt);})
			.attr('width', x.bandwidth())
			.attr('height', function(d) {return y(0) - y(d.cnt); })
			.on('click', function(d,i){
				d3.select(this).transition()
					.duration('50')
					.style('stroke-width', '1');
				d3.select("#character-name").html(i.cnt);
			})

			.on('mouseover', function (d, i) {
		          d3.select(this).transition()
		               .duration(200)
		               .style('opacity', 1);
		          div.transition()
		               .duration(50)
		               .style("opacity", 1);
		          div.html("<p>Character: " + i.char + "<br/>Count: " + i.cnt)
		               .style("left", (d.pageX + 10) + "px")
		               .style("top", (d.pageY - 28) + "px");
     		})

     		.on('mouseout', function (d, i) {
		          d3.select(this).transition()
		               .duration('50')
		               .attr('opacity', '1');
		          div.transition()
		               .duration('50')
		               .style("opacity", 0);
     		});



		svg.append("g")
      	.attr("transform", "translate(0," + 336 + ")")
      	.call(d3.axisBottom(x));

      	svg.append("g")
      	.attr("transform", "translate(30, 0)")
      	.call(d3.axisLeft(y));


}


function submitText(text){

	var map_vowels = new Map();
	var map_consonants = new Map();
	var map_punctuations= new Map();

	var count_vowels = 0;
	var count_consonants = 0;
	var count_punctuations = 0;
	var total = 0;

	for (let letter of vowels){
		map_vowels[letter] = 0;
	}

	for (let letter of consonants){
		map_consonants[letter] = 0;
	}

	for(let letter of punctuations){
		map_punctuations[letter] = 0;
	}


	for (let letter of text.toLowerCase()){

		if(vowels.includes(letter)){

			map_vowels[letter] = map_vowels[letter] + 1;
			count_vowels++;

		}
		else if(consonants.includes(letter)){

			map_consonants[letter] = map_consonants[letter] + 1;
			count_consonants++;

		}
		else if(punctuations.includes(letter)){

			map_punctuations[letter] = map_punctuations[letter] + 1;
			count_punctuations++;

		}

	}

	total = count_vowels + count_consonants +  count_punctuations;


    width = 580;
    height = 400;
    margin = 40;

    radius = Math.min(width, height) / 2 - margin

    var data = [{
    			title: "vowels", 
    			value: count_vowels,
    			elements: map_vowels
    			},
    			{
    			title: "consonants",
    			value: count_consonants,
    			elements: map_consonants
    			},
    			{
    			title: "punctuations",
    			value: count_punctuations,
    			elements: map_punctuations
    			}];



    d3.selectAll('path').remove();
    
    var color = d3.scaleOrdinal()
      .range(["#CD5C5C", "#008000", "#7b6888"])


    svg = d3.select("#pie_svg")
      .append("svg")
        .attr("width", width)
        .attr("height", height)
      .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);


	var pie = d3.pie()
	     .value(function (d) {
	          return d.value;
	     })
	     .sort(null);


    var arc = d3.arc()
     .innerRadius(100)
     .outerRadius(radius);

    d3.select("#bar_svg").select('svg').remove();
    var path = svg
		      .selectAll('path')
		      .data(pie(data))
		      .join('path')
		      .attr('d', arc)
		      .attr('fill', function (d, i) {
          			return color(d.data.title);
     		  })
		      .attr("stroke", "black")
		      .style("stroke-width", "1px")
		      .style("opacity", 0.7)
		      .attr('transform', 'translate(0, 0)')
		      .on('mouseover', function (d, i) {
		      	  d3.select("#pie_text").transition()
                    .attr('opacity',1)
                    .duration('100');

		          d3.select(this).transition()
                    .duration('100')
                    .style("stroke-width", "4")
                    
                  d3.select("#pie_text").html(i.data.title + " : " + i.data.value)
                    .style("left", width/1.65 + "px")
                    .style("top", height*1.65 + "px");
		      })
	          .on('mouseout', function (d, i) {
	          	d3.select("#pie_text").transition()
	          	.attr('opacity',0)
	            .duration('100');
	           	d3.select(this).transition()
	            .duration('100')
	            .style("stroke-width", "1")
                d3.select("#pie_text").html("")
              })
              .on('click', function(d,i){
              	d3.select("#bar_svg").select('svg').remove();
              	barchart(i.data.elements, color(i.data.title));
              })

}