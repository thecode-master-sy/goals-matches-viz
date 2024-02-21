import { csvParse, scaleLinear } from "d3";
import { scatterPlot } from "./scatterPlot";

export const viz = (
	svg,
	{
		innerRectFill,
		marginLeft,
		marginRight,
		marginTop,
		marginBottom,
		state,
		setState,
	}
) => {
	//extract the data, width and height from the state object
	const { data, width, height } = state;

	//add margins to the visualization. you can tweak the margins from render.js
	const vizInnerWidth = width - marginLeft - marginRight;
	const vizInnerHeight = height - marginTop - marginBottom;

	//creating the gray rectangle, this is only for visual purposes you do not need to do this
	svg
		.selectAll("rect")
		.data([null])
		.join("rect")
		.attr("x", marginLeft)
		.attr("y", marginTop)
		.attr("width", vizInnerWidth)
		.attr("height", vizInnerHeight)
		.attr("fill", innerRectFill);

	//only display scatter plot when the data has been fully loaded
	if (data && data !== "LOADING") {
		svg.call(scatterPlot, {
			data,
			width,
			height,
			margins: { marginTop, marginBottom, marginRight, marginLeft },
			xValue: (d) => d.matches_played,
			yValue: (d) => d.goals,
			sizeValue: (d) => d["shots per avg match"],
			// sizeLegendLabel: "shots per avg match",
			// sizeLegendX: 300,
			// sizeLegendY: 50,
			circleLabel: (d) => d["player names"],
			colorValue: (d) => d.league,
			xAxisLabel: "matches played",
			yAxisLabel: "goals",
			colorLegendLabel: "leagues",
			colorLegendX: 50,
			colorLegendY: 50,
			circleOpacity: 0.5,
		});
	}

	// state.data could be:
	// * undefined
	// * 'LOADING'
	// * An array of objects
	//we only want to fetch the data, if there is no data in the state object
	if (data === undefined) {
		//just before we start fetching set the state to be LOADING
		setState((state) => ({ ...state, data: "LOADING" }));

		fetch("./data.csv")
			.then((response) => response.text())
			.then((csvData) => {
				const rawData = csvParse(csvData);

				//convert all the keys to a lower case value
				const transformedData = rawData.map((obj) => {
					const newObj = {};

					Object.keys(obj).forEach(
						(key) => (newObj[key.toLowerCase()] = obj[key])
					);

					return newObj;
				});

				//convert quantitative attributes to be used to numbers
				//we would use only goals, matches_played and xG as quantitative attributes
				transformedData.forEach((obj) => {
					obj.goals = Number(obj.goals);
					obj.matches_played = Number(obj.matches_played);
					obj.shots = Number(obj.shots);
					obj["shots per avg match"] = Number(obj["shots per avg match"]);
					obj.year = Number(obj.year);
				});

				const yearData = transformedData.filter(
					(d) =>
						d.year === 2018 &&
						(d.league === "La Liga" ||
							d.league === "Serie A" ||
							d.league === "Bundesliga")
				);

				console.log(yearData);

				//update the state
				setState((state) => ({ ...state, data: yearData }));
			});
	}
};
