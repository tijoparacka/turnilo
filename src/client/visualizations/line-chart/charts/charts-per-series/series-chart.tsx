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

import { Dataset, Datum, NumberRange, TimeRange } from "plywood";
import * as React from "react";
import { NORMAL_COLORS } from "../../../../../common/models/colors/colors";
import { Essence } from "../../../../../common/models/essence/essence";
import { ConcreteSeries, SeriesDerivation } from "../../../../../common/models/series/concrete-series";
import { Stage } from "../../../../../common/models/stage/stage";
import { Unary } from "../../../../../common/utils/functional/functional";
import { readNumber } from "../../../../../common/utils/general/general";
import { VisMeasureLabel } from "../../../../components/vis-measure-label/vis-measure-label";
import { SPLIT } from "../../../../config/constants";
import { BaseChart } from "../../base-chart/base-chart";
import { ColoredSeriesChartLine } from "../../chart-line/colored-series-chart-line";
import { SingletonSeriesChartLine } from "../../chart-line/singleton-series-chart-line";
import { InteractionsProps } from "../../interactions/interaction-controller";
import { ContinuousTicks } from "../../utils/pick-x-axis-ticks";
import { ContinuousScale } from "../../utils/scale";
import { getContinuousSplit, getNominalSplit, hasNominalSplit } from "../../utils/splits";
import calculateExtend from "./extend";

interface SeriesChartProps {
  interactions: InteractionsProps;
  essence: Essence;
  dataset: Dataset;
  series: ConcreteSeries;
  xScale: ContinuousScale;
  xTicks: ContinuousTicks;
  chartStage: Stage;
}

export const SeriesChart: React.SFC<SeriesChartProps> = props => {
  const { interactions, chartStage, essence, series, xScale, xTicks, dataset } = props;

  const datum = dataset.data[0];
  const continuousSplitDataset = datum[SPLIT] as Dataset;
  const hasComparison = essence.hasComparison();

  const label = <VisMeasureLabel
    series={series}
    datum={datum}
    showPrevious={hasComparison} />;

  const continuousSplit = getContinuousSplit(essence);
  const getX = (d: Datum) => d[continuousSplit.reference] as (TimeRange | NumberRange);
  const getY: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d));
  const getYP: Unary<Datum, number> = (d: Datum) => readNumber(series.selectValue(d, SeriesDerivation.PREVIOUS));

  const domain = calculateExtend(continuousSplitDataset, essence.splits, getY, getYP);

  if (hasNominalSplit(essence)) {
    const nominalSplit = getNominalSplit(essence);
    return <BaseChart
      chartId={series.plywoodKey()}
      interactions={interactions}
      label={label}
      xScale={xScale}
      xTicks={xTicks}
      chartStage={chartStage}
      formatter={series.formatter()}
      yDomain={domain}>
      {({ yScale, lineStage }) => <React.Fragment>
        {continuousSplitDataset.data.map((datum, index) => {
          const splitKey = datum[nominalSplit.reference];
          const color = NORMAL_COLORS[index];
          const dataset = (datum[SPLIT] as Dataset).data;
          return <ColoredSeriesChartLine
            key={String(splitKey)}
            xScale={xScale}
            yScale={yScale}
            getX={getX}
            color={color}
            dataset={dataset}
            stage={lineStage}
            essence={essence}
            series={series} />;
        })}
      </React.Fragment>}
    </BaseChart>;
  }

  return <BaseChart
    chartId={series.plywoodKey()}
    interactions={interactions}
    label={label}
    chartStage={chartStage}
    yDomain={domain}
    formatter={series.formatter()}
    xScale={xScale}
    xTicks={xTicks}>
    {({ yScale, lineStage }) => <SingletonSeriesChartLine
      xScale={xScale}
      yScale={yScale}
      getX={getX}
      dataset={continuousSplitDataset.data}
      stage={lineStage}
      essence={essence}
      series={series} />}
  </BaseChart>;
};
