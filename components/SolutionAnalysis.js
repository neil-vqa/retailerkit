export class SolutionAnalysis extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `
        <style>
          .container {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: flex-start;
          }
          .chart-container {
            border: 1px solid #ccc;
            padding: 20px;
            background-color: white;
            text-align: center; /* Center align content */
          }
          h2 {
            text-align: center;
            color: #333;
          }
          .axis-label {
            font-size: 0.9em;
            fill: #555;
          }
          .dot {
            fill: steelblue;
            stroke: #fff;
            cursor: pointer;
            transition: r 0.2s, fill 0.2s;
          }
          .dot:hover {
            fill: orange;
            r: 8px;
          }
          .dot.selected {
            fill: orangered;
            r: 9px;
            stroke: black;
            stroke-width: 2px;
          }
          .bar {
            fill: steelblue;
          }
          .bar-label {
            font-size: 0.8em;
            fill: #333;
            text-anchor: middle;
          }
          .info-container {
            margin-top: 15px;
            font-size: 0.9em;
            color: #333;
            text-align: center;
          }
        </style>
        <div class="container">
          <div class="chart-container">
            <h4>Solution Space: Profit vs. Value Score</h4>
            <div id="scatter-plot"></div>
            <!-- Div to display scatter plot point info -->
            <div id="scatter-plot-info" class="info-container"></div>
          </div>
          <div class="chart-container">
            <h4 id="bar-chart-title">Production Plan</h4>
            <div id="bar-chart"></div>
          </div>
        </div>
      `;
  }

  connectedCallback() {
    if (this.data) {
      this.render();
    }
  }

  set data(data) {
    this._data = data;
    if (this.isConnected) {
      this.render();
    }
  }

  get data() {
    return this._data;
  }

  render() {
    const scatterPlotContainer = this.shadowRoot.getElementById("scatter-plot");
    const barChartContainer = this.shadowRoot.getElementById("bar-chart");
    const scatterPlotInfo = this.shadowRoot.getElementById("scatter-plot-info");

    scatterPlotContainer.innerHTML = "";
    barChartContainer.innerHTML = "";
    scatterPlotInfo.innerHTML = "";

    if (
      !this._data ||
      !this._data.solutions ||
      this._data.solutions.length === 0
    ) {
      scatterPlotInfo.innerHTML = "Compute a solution to see analysis.";
      this.shadowRoot.getElementById("bar-chart-title").textContent =
        "Production Plan";
      return;
    }

    const productNameMap = new Map(
      this._data.products.map((p) => [p.id, p.name])
    );

    const processedData = this._data.solutions.map((d, i) => ({
      id: i,
      gross_profit: d.financial_summary.gross_profit,
      total_value_score: d.strategic_summary.total_value_score,
      production_plan: d.production_plan,
    }));

    const margin = { top: 20, right: 30, bottom: 50, left: 60 };
    const width = 460 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svgScatter = d3
      .select(scatterPlotContainer)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d.gross_profit))
      .range([0, width]);
    svgScatter
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    const y = d3
      .scaleLinear()
      .domain(d3.extent(processedData, (d) => d.total_value_score))
      .range([height, 0]);
    svgScatter.append("g").call(d3.axisLeft(y));

    svgScatter
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 20)
      .attr("class", "axis-label")
      .text("Gross Profit");

    svgScatter
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("class", "axis-label")
      .text("Total Value Score");

    const barWidth = 350 - margin.left - margin.right;
    const barHeight = 350 - margin.top - margin.bottom;

    const svgBar = d3
      .select(barChartContainer)
      .append("svg")
      .attr("width", barWidth + margin.left + margin.right)
      .attr("height", barHeight + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xBar = d3.scaleBand().range([0, barWidth]).padding(0.2);
    const yBar = d3.scaleLinear().range([barHeight, 0]);

    const xAxisBar = svgBar
      .append("g")
      .attr("transform", `translate(0,${barHeight})`);
    const yAxisBar = svgBar.append("g");

    const updateBarChart = (solutionData) => {
      const planData = Object.entries(solutionData.production_plan).map(
        ([key, value]) => ({
          product: productNameMap.get(key) || key,
          quantity: value,
        })
      );

      xBar.domain(planData.map((d) => d.product));
      yBar.domain([0, d3.max(planData, (d) => d.quantity)]);

      xAxisBar.call(d3.axisBottom(xBar));
      yAxisBar.transition().duration(300).call(d3.axisLeft(yBar));

      svgBar
        .selectAll(".bar")
        .data(planData)
        .join("rect")
        .attr("class", "bar")
        .transition()
        .duration(300)
        .attr("x", (d) => xBar(d.product))
        .attr("y", (d) => yBar(d.quantity))
        .attr("width", xBar.bandwidth())
        .attr("height", (d) => barHeight - yBar(d.quantity));

      svgBar
        .selectAll(".bar-label")
        .data(planData)
        .join("text")
        .attr("class", "bar-label")
        .transition()
        .duration(300)
        .attr("x", (d) => xBar(d.product) + xBar.bandwidth() / 2)
        .attr("y", (d) => yBar(d.quantity) - 5)
        .text((d) => d.quantity);

      svgScatter
        .selectAll(".dot")
        .classed("selected", (d) => d.id === solutionData.id);

      scatterPlotInfo.innerHTML = `<strong>Gross Profit:</strong> ${solutionData.gross_profit.toFixed(
        2
      )} | <strong>Total Value Score:</strong> ${solutionData.total_value_score.toFixed(
        2
      )}`;
    };

    svgScatter
      .append("g")
      .selectAll("dot")
      .data(processedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.gross_profit))
      .attr("cy", (d) => y(d.total_value_score))
      .attr("r", 6)
      .on("click", (event, d) => {
        updateBarChart(d);
      });

    updateBarChart(processedData[0]);
  }
}
