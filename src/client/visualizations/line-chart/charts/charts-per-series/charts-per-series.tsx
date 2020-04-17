/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Dataset } from "plywood";
import * as React from "react";
import { Essence } from "../../../../../common/models/essence/essence";
import { Stage } from "../../../../../common/models/stage/stage";
import { VIS_H_PADDING } from "../../../../config/constants";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { SeriesChart } from "./series-chart";

interface ChartsPerSeriesProps {
  essence: Essence;
  dataset: Dataset;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  stage: Stage;
}

const X_AXIS_HEIGHT = 30;
const MIN_CHART_HEIGHT = 140;
const MAX_ASPECT_RATIO = 1; // width / height

function calculateChartStage(stage: Stage, seriesCount: number): Stage {
  const chartWidth = stage.width - VIS_H_PADDING * 2;
  const chartHeight = Math.max(
    MIN_CHART_HEIGHT,
    Math.floor(Math.min(
      chartWidth / MAX_ASPECT_RATIO,
      (stage.height - X_AXIS_HEIGHT) / seriesCount
    ))
  );
  return new Stage({
    x: VIS_H_PADDING,
    y: 0,
    width: chartWidth,
    height: chartHeight
  });
}

export const ChartsPerSeries: React.SFC<ChartsPerSeriesProps> = props => {
  const { xScale, xTicks, essence, dataset, stage } = props;

  const concreteSeries = essence.getConcreteSeries().toArray();
  const chartStage = calculateChartStage(stage, essence.series.count());

  return <React.Fragment>
    {concreteSeries.map(series =>
      <SeriesChart
        key={series.reactKey()}
        dataset={dataset}
        essence={essence}
        series={series}
        chartStage={chartStage}
        xScale={xScale}
        xTicks={xTicks}/>
    )}
  </React.Fragment>;
};