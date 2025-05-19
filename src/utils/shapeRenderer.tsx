import React from 'react';
import { Rect, Circle, Ellipse, Star, RegularPolygon } from 'react-konva';
import { Store } from '../types/store';

type CommonProps = {
  draggable: boolean;
  onClick: () => void;
  onDblClick: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: () => void;
  rotation: number;
  ref: (node: any) => void;
};

export const renderShape = (store: Store, commonProps: CommonProps) => {
  const props = {
    ...commonProps,
    key: store.id
  };

  switch (store.shapeType) {
    case 'circle':
      return (
        <Circle
          {...props}
          x={store.x}
          y={store.y}
          radius={Math.min(store.width, store.height) / 2}
          fill={store.color}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          {...props}
          x={store.x}
          y={store.y}
          radiusX={store.width / 2}
          radiusY={store.height / 2}
          fill={store.color}
        />
      );
    case 'star':
      return (
        <Star
          {...props}
          x={store.x}
          y={store.y}
          numPoints={5}
          innerRadius={store.width / 4}
          outerRadius={store.width / 2}
          fill={store.color}
        />
      );
    case 'hexagon':
      return (
        <RegularPolygon
          {...props}
          x={store.x}
          y={store.y}
          sides={6}
          radius={store.width / 2}
          fill={store.color}
        />
      );
    case 'triangle':
      return (
        <RegularPolygon
          {...props}
          x={store.x}
          y={store.y}
          sides={3}
          radius={store.width / 2}
          fill={store.color}
        />
      );
    case 'diamond':
      return (
        <RegularPolygon
          {...props}
          x={store.x}
          y={store.y}
          sides={4}
          radius={store.width / 2}
          fill={store.color}
        />
      );
    case 'rounded':
      return (
        <Rect
          {...props}
          x={store.x}
          y={store.y}
          width={store.width}
          height={store.height}
          cornerRadius={15}
          fill={store.color}
          stroke='black'
        />
      );
    case 'rect':
    default:
      return (
        <Rect
          {...props}
          x={store.x}
          y={store.y}
          width={store.width}
          height={store.height}
          fill={store.color}
          stroke='black'
        />
      );
  }
};
