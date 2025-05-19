import React from 'react';
import { Rect, Circle, Ellipse, RegularPolygon, Shape } from 'react-konva';
import { Store } from '../types/store';
import Konva from 'konva';

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
    case 'custom1':
      return (
        <Shape
          {...props}
          x={store.x}
          y={store.y}
          width={store.width}
          height={store.height}
          fill={store.color}
          stroke='black'
          strokeWidth={1}
          draggable={commonProps.draggable}
          onClick={commonProps.onClick}
          onDblClick={commonProps.onDblClick}
          onDragEnd={commonProps.onDragEnd}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Calculate new dimensions
            const newWidth = Math.round(store.width * scaleX);
            const newHeight = Math.round(store.height * scaleY);

            // Update the node's width and height
            node.width(newWidth);
            node.height(newHeight);

            // Reset scale to 1
            node.scaleX(1);
            node.scaleY(1);

            // Call the original onTransformEnd
            commonProps.onTransformEnd();
          }}
          sceneFunc={(context, shape) => {
            const width = shape.getAttr('width');
            const height = shape.getAttr('height');
            const cutSize = Math.min(width, height) * 0.7;

            context.beginPath();
            // Start from the cut-off point on top
            context.moveTo(cutSize, 0);
            // Draw to the top-right corner
            context.lineTo(width, 0);
            // Draw to the bottom-right corner
            context.lineTo(width, height);
            // Draw to the bottom-left corner
            context.lineTo(0, height);
            // Draw to the cut-off point on left
            context.lineTo(0, cutSize);
            // Close the path
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          getClientRect={(shape: Konva.Shape) => {
            const width = shape.getAttr('width');
            const height = shape.getAttr('height');
            return {
              x: 0,
              y: 0,
              width: width,
              height: height
            };
          }}
        />
      );
    case 'custom2':
      return (
        <Shape
          {...props}
          x={store.x}
          y={store.y}
          width={store.width}
          height={store.height}
          fill={store.color}
          stroke='black'
          strokeWidth={1}
          draggable={commonProps.draggable}
          onClick={commonProps.onClick}
          onDblClick={commonProps.onDblClick}
          onDragEnd={commonProps.onDragEnd}
          onTransformEnd={(e) => {
            const node = e.target;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            // Calculate new dimensions
            const newWidth = Math.round(store.width * scaleX);
            const newHeight = Math.round(store.height * scaleY);

            // Update the node's width and height
            node.width(newWidth);
            node.height(newHeight);

            // Reset scale to 1
            node.scaleX(1);
            node.scaleY(1);

            // Call the original onTransformEnd
            commonProps.onTransformEnd();
          }}
          sceneFunc={(context, shape) => {
            const width = shape.getAttr('width');
            const height = shape.getAttr('height');
            const cutSize = Math.min(width, height) * 0.7;

            context.beginPath();
            // Start from the top-left corner
            context.moveTo(0, 0);
            // Draw to the cut-off point on top
            context.lineTo(width - cutSize, 0);
            // Draw to the top-right corner
            context.lineTo(width, cutSize);
            // Draw to the bottom-right corner
            context.lineTo(width, height);
            // Draw to the bottom-left corner
            context.lineTo(0, height);
            // Close the path
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          getClientRect={(shape: Konva.Shape) => {
            const width = shape.getAttr('width');
            const height = shape.getAttr('height');
            return {
              x: 0,
              y: 0,
              width: width,
              height: height
            };
          }}
        />
      );
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
