import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const StreamGraph = ({ data }) => {
  const chartRef = useRef();

  useEffect(() => {
    const chartContainer = d3.select(chartRef.current);

    chartContainer.select("svg").remove();
    chartContainer.select(".tooltip").remove();

    const margin = { top: 20, right: 430, bottom: 50, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const keys = ["LLaMA-3.1", "Claude", "PaLM-2", "Gemini", "GPT-4"];

    const parsedData = data.map((d) => ({
      Date: new Date(d.Date),
      ...keys.reduce((acc, key) => {
        acc[key] = +d[key] || 0;
        return acc;
      }, {}),
    }));

    const stackedData = d3.stack()
      .keys(keys)
      .offset(d3.stackOffsetWiggle)(parsedData);

    const colorScale = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]);

    const xScale = d3
      .scaleTime()
      .domain(d3.extent(parsedData, (d) => d.Date))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([
        d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0])),
        d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1])),
      ])
      .range([height, 0]);

    const svg = chartContainer
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const area = d3
      .area()
      .x((d) => xScale(d.data.Date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveBasis);

    svg
      .selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d) => colorScale(d.key))
      .style("opacity", 1)
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseout", handleMouseOut);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b"))
      );

    const legend = svg
      .selectAll(".legend")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (_, i) => `translate(${width + 20}, ${i * 25})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .style("fill", (d) => colorScale(d));

    legend
      .append("text")
      .attr("x", 30)
      .attr("y", 15)
      .text((d) => d)
      .style("font-size", "14px")
      .style("alignment-baseline", "middle");

    const tooltip = chartContainer
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("box-shadow", "0px 4px 8px rgba(0, 0, 0, 0.1)")
      .style("padding", "10px")
      .style("pointer-events", "none")
      .style("display", "none");

    function handleMouseOver(event, d) {
      const modelKey = d.key;
      tooltip.style("display", "block");

      const barData = parsedData.map((entry) => ({
        Date: entry.Date,
        Value: entry[modelKey],
      }));

      const barWidth = 200;
      const barHeight = 100;
      const barMargin = { top: 10, right: 10, bottom: 20, left: 30 };

      tooltip.select("svg").remove();

      const miniSvg = tooltip
        .append("svg")
        .attr("width", barWidth + barMargin.left + barMargin.right)
        .attr("height", barHeight + barMargin.top + barMargin.bottom)
        .append("g")
        .attr("transform", `translate(${barMargin.left}, ${barMargin.top})`);

      const barX = d3
        .scaleBand()
        .domain(barData.map((d) => d3.timeFormat("%b")(d.Date)))
        .range([0, barWidth])
        .padding(0.1);

      const barY = d3
        .scaleLinear()
        .domain([0, d3.max(barData, (d) => d.Value)])
        .range([barHeight, 0]);

      miniSvg
        .selectAll(".bar")
        .data(barData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d) => barX(d3.timeFormat("%b")(d.Date)))
        .attr("y", (d) => barY(d.Value))
        .attr("width", barX.bandwidth())
        .attr("height", (d) => barHeight - barY(d.Value))
        .style("fill", colorScale(modelKey));

      miniSvg.append("g").call(d3.axisLeft(barY).ticks(4));
      miniSvg.append("g").attr("transform", `translate(0,${barHeight})`).call(d3.axisBottom(barX));
    }

    function handleMouseMove(event) {
      tooltip
        .style("top", `${event.pageY + 20}px`)
        .style("left", `${event.pageX + 20}px`);
    }

    function handleMouseOut() {
      tooltip.style("display", "none");
    }
  }, [data]);

  return <div ref={chartRef}></div>;
};

export default StreamGraph;
