import React, { useRef, useEffect } from "react";
import { Shape, Transformer, Group, Circle, Text } from "react-konva";
import Konva from "konva";

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

const RectWithTransformer = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  onDragMove,
}: {
  shapeProps: Rectangle;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Rectangle) => void;
  onDragMove?: (attrs: Rectangle) => void;
}) => {
  const shapeRef = useRef<Konva.Shape>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const menuRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Sync menu position when props change (e.g. initial load or external update)
  useEffect(() => {
    if (menuRef.current) {
      menuRef.current.position({ x: shapeProps.x, y: shapeProps.y });
      menuRef.current.rotation(shapeProps.rotation);
      menuRef.current.scale({ x: 1, y: 1 }); // Reset scale
    }
  }, [shapeProps]);

  return (
    <React.Fragment>
      <Shape
        sceneFunc={(context, shape) => {
          const w = shape.width();
          const h = shape.height();
          // Leave middle 40% empty on top and bottom
          const gapRatio = 0.4;
          const gapStart = w * (0.5 - gapRatio / 2);
          const gapEnd = w * (0.5 + gapRatio / 2);

          context.beginPath();
          // Left vertical line
          context.moveTo(0, 0);
          context.lineTo(0, h);

          // Right vertical line
          context.moveTo(w, 0);
          context.lineTo(w, h);

          // Top left segment
          context.moveTo(0, 0);
          context.lineTo(gapStart, 0);

          // Top right segment
          context.moveTo(gapEnd, 0);
          context.lineTo(w, 0);

          // Bottom left segment
          context.moveTo(0, h);
          context.lineTo(gapStart, h);

          // Bottom right segment
          context.moveTo(gapEnd, h);
          context.lineTo(w, h);

          // Only stroke, no fill for the lines
          context.fillStrokeShape(shape);
        }}
        shadowColor='black'
        shadowBlur={isSelected ? 10 : 0}
        shadowOpacity={isSelected ? 0.6 : 0}
        shadowOffset={{ x: 0, y: 0 }}
        strokeWidth={
          isSelected
            ? (shapeProps.strokeWidth || 2) + 2
            : shapeProps.strokeWidth || 2
        }
        hitFunc={(context, shape) => {
          // Full rectangle for hit detection
          context.beginPath();
          context.rect(0, 0, shape.width(), shape.height());
          context.fillShape(shape);
        }}
        onMouseDown={onSelect}
        onTouchStart={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        dragBoundFunc={(pos) => {
          const node = shapeRef.current;
          if (!node) return pos;
          const stage = node.getStage();
          if (!stage) return pos;

          const stageWidth = stage.width();
          const stageHeight = stage.height();

          // 获取当前矩形的宽高（考虑缩放，虽然目前禁用了缩放）
          const width = node.width() * node.scaleX();
          const height = node.height() * node.scaleY();

          // 限制 x 和 y，确保矩形在舞台范围内
          // 注意：这是一个简化的边界检查，未完美处理旋转后的包围盒
          // 但能防止矩形被拖出可视区域
          let x = pos.x;
          let y = pos.y;

          // 左边界和上边界限制
          if (x < 0) x = 0;
          if (y < 0) y = 0;

          // 右边界和下边界限制
          if (x > stageWidth - width) x = stageWidth - width;
          if (y > stageHeight - height) y = stageHeight - height;

          return { x, y };
        }}
        onDragMove={(e) => {
          const node = shapeRef.current;
          if (node && onDragMove) {
            onDragMove({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              rotation: node.rotation(),
            });
          }
          // Sync menu position
          if (menuRef.current) {
            menuRef.current.position(e.target.position());
            menuRef.current.rotation(e.target.rotation());
          }
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransform={(e) => {
          // Sync menu position during transform
          if (menuRef.current) {
            menuRef.current.position(e.target.position());
            menuRef.current.rotation(e.target.rotation());
          }
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          if (!node) return;

          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // We reset scale to 1 for the state, but since resize is disabled,
          // scale shouldn't change significantly unless via some other means.
          // Rotation is what we care about.

          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // width and height should stay same if resize is disabled
            rotation: node.rotation(),
          });

          // Reset node scale to 1 to keep things clean
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <React.Fragment>
          <Transformer
            ref={trRef}
            resizeEnabled={false}
            rotateEnabled={true}
            borderEnabled={false}
          />
          <Group
            ref={menuRef}
            x={shapeProps.x}
            y={shapeProps.y}
            rotation={shapeProps.rotation}
          >
            <Group
              x={shapeProps.width / 2}
              y={-40}
              onClick={(e) => {
                e.cancelBubble = true;
                const { x, y, width, height, rotation } = shapeProps;
                // Calculate center point offset relative to the anchor (x,y)
                // Formula for rotating vector (width/2, height/2) by 'rotation' degrees
                const rad = (rotation * Math.PI) / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const dx = width / 2;
                const dy = height / 2;

                // Vector from anchor to center
                const vecX = dx * cos - dy * sin;
                const vecY = dx * sin + dy * cos;

                // To rotate 180 degrees around the center, we need to move the anchor point.
                // New Anchor = Old Anchor + 2 * (Vector from Anchor to Center)
                onChange({
                  ...shapeProps,
                  x: x + 2 * vecX,
                  y: y + 2 * vecY,
                  rotation: (rotation + 180) % 360,
                });
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                const { x, y, width, height, rotation } = shapeProps;
                const rad = (rotation * Math.PI) / 180;
                const cos = Math.cos(rad);
                const sin = Math.sin(rad);
                const dx = width / 2;
                const dy = height / 2;

                const vecX = dx * cos - dy * sin;
                const vecY = dx * sin + dy * cos;

                onChange({
                  ...shapeProps,
                  x: x + 2 * vecX,
                  y: y + 2 * vecY,
                  rotation: (rotation + 180) % 360,
                });
              }}
              onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) stage.container().style.cursor = "default";
              }}
            >
              <Circle
                radius={14}
                fill='#1890ff'
                stroke='white'
                strokeWidth={2}
                shadowColor='black'
                shadowBlur={5}
                shadowOpacity={0.3}
              />
              <Text
                text='↻'
                fill='white'
                fontSize={20}
                fontStyle='bold'
                align='center'
                verticalAlign='middle'
                offsetX={10} // Center text horizontally (approx half of font size width)
                offsetY={10} // Center text vertically
              />
              <Text
                text='180°'
                fill='#333'
                fontSize={10}
                align='center'
                x={-10}
                y={18}
                width={20}
              />
            </Group>
          </Group>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default RectWithTransformer;
