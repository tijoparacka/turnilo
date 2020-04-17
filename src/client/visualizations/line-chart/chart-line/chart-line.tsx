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

import * as d3 from "d3";
import { Dataset, Datum, NumberRange, PlywoodRange, TimeRange } from "plywood";
import * as React from "react";
import { Stage } from "../../../../common/models/stage/stage";
import { concatTruthy, flatMap, Unary } from "../../../../common/utils/functional/functional";
import "./chart-line.scss";

export type Scale = d3.scale.Linear<number, number>;

type Range = NumberRange | TimeRange;

interface ChartLineProps {
  // TODO: ContinuousScale does not have compatible call signatures (union of function getting number and Date)
  xScale: any;
  yScale: Scale;
  getX: Unary<Datum, Range>;
  getY: Unary<Datum, number>;
  color?: string;
  showArea: boolean;
  dashed: boolean;
  dataset: Dataset;
  stage: Stage;
}

type DataPoint = [number, number];

const stroke = (color: string, dashed: boolean): Pick<React.CSSProperties, "stroke" | "strokeDasharray"> => ({
  stroke: color,
  strokeDasharray: dashed ? "4 2" : undefined
});

function areDetached(a: PlywoodRange, b: PlywoodRange): boolean {
  return a.end.valueOf() !== b.start.valueOf();
}

function prepareDataPoints(props: Pick<ChartLineProps, "dataset" | "getX" | "getY">): DataPoint[] {
  const { getX, getY, dataset } = props;
  const datums = dataset.data;
  return flatMap(datums, (datum, index) => {

    const range = getX(datum);
    const rangeMidpoint = range.midpoint();
    const measureValue = getY(datum);
    const previous = datums[index - 1];
    const next = datums[index + 1];
    const midValue = rangeMidpoint.valueOf();
    const rangeWidth = range.end.valueOf() - range.start.valueOf();

    return concatTruthy(
      previous && areDetached(getX(previous), range) && [0, midValue - rangeWidth] as DataPoint,
      [rangeMidpoint, isNaN(measureValue) ? 0 : measureValue] as DataPoint,
      next && areDetached(range, getX(next)) && [0, midValue + rangeWidth] as DataPoint
    );
  });
}

export const ChartLine: React.SFC<ChartLineProps> = props => {
  const { color, dashed, showArea, stage, xScale, yScale } = props;

  const area = d3.svg.area().y0(yScale(0));
  const line = d3.svg.line();

  const points = prepareDataPoints(props);
  const scaledPoints = points.map(([x, y]) => [xScale(x), yScale(y)] as DataPoint);
  const hasMultiplePoints = points.length > 1;

  return <g className="chart-line" transform={stage.getTransform()}>
    {hasMultiplePoints && <path className="line" d={line(scaledPoints)} style={stroke(color, dashed)} />}
    {hasMultiplePoints && showArea && <path className="area" d={area(scaledPoints)} />}
    {!hasMultiplePoints && <circle
      className="singleton"
      cx={scaledPoints[0][0]}
      cy={scaledPoints[0][1]}
      r="2"
      style={{ fill: color }}
    />}
  </g>;
};