import React from 'react';
import { Text } from 'react-konva';
import { TextLabel } from '../types/text';
import Konva from 'konva';

type CommonProps = {
  draggable: boolean;
  onClick: () => void;
  onDblClick: () => void;
  onDragEnd: (e: any) => void;
  onTransformEnd: () => void;
  ref: (node: any) => void;
};

export const renderText = (label: TextLabel, commonProps: CommonProps) => {
  return (
    <Text
      key={label.id}
      text={label.text}
      x={label.x}
      y={label.y}
      fontSize={label.fontSize}
      fontFamily={label.fontFamily}
      fill={label.fill}
      rotation={label.rotation || 0}
      offsetX={0}
      offsetY={0}
      draggable={commonProps.draggable}
      onClick={commonProps.onClick}
      onDblClick={commonProps.onDblClick}
      onDragEnd={commonProps.onDragEnd}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Text;
        const scaleX = node.scaleX();

        // Calculate new dimensions
        const newFontSize = Math.round(label.fontSize * scaleX);

        // Update the node's fontSize
        node.fontSize(newFontSize);

        // Reset scale to 1
        node.scaleX(1);
        node.scaleY(1);

        // Call the original onTransformEnd
        commonProps.onTransformEnd();
      }}
      ref={commonProps.ref}
    />
  );
};
