import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Transformer, Line } from 'react-konva';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Store, ShapeType } from './types/store';
import { TextLabel } from './types/text';
import { Canvas } from './types/canvas';
import { renderShape } from './utils/shapeRenderer';
import { renderText } from './utils/textRenderer';

const CANVASES: Canvas[] = [
  { id: 1, name: 'Chợ chính' },
  { id: 2, name: 'Chợ phụ' }
];

const MarketMap: React.FC = () => {
  const [selectedCanvasId, setSelectedCanvasId] = useState<number>(1);
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(`market-layout-${selectedCanvasId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [textLabels, setTextLabels] = useState<TextLabel[]>(() => {
    const saved = localStorage.getItem(
      `market-text-labels-${selectedCanvasId}`
    );
    return saved ? JSON.parse(saved) : [];
  });

  const [lines, setLines] = useState<any[]>(() => {
    const saved = localStorage.getItem(`market-drawings-${selectedCanvasId}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const trRef = useRef<any>(null);
  const textTrRef = useRef<any>(null);
  const shapeRefs = useRef<Map<number, any>>(new Map());
  const textRefs = useRef<Map<number, any>>(new Map());
  const stageRef = useRef<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('brush');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [tempLine, setTempLine] = useState<any>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const savedStores = localStorage.getItem(
      `market-layout-${selectedCanvasId}`
    );
    const savedTextLabels = localStorage.getItem(
      `market-text-labels-${selectedCanvasId}`
    );
    const savedLines = localStorage.getItem(
      `market-drawings-${selectedCanvasId}`
    );

    setStores(savedStores ? JSON.parse(savedStores) : []);
    setTextLabels(savedTextLabels ? JSON.parse(savedTextLabels) : []);
    setLines(savedLines ? JSON.parse(savedLines) : []);
    setSelectedId(null);
    setSelectedTextId(null);
  }, [selectedCanvasId]);

  useEffect(() => {
    if (
      selectedId !== null &&
      trRef.current &&
      shapeRefs.current.has(selectedId)
    ) {
      trRef.current.nodes([shapeRefs.current.get(selectedId)]);
      trRef.current.getLayer().batchDraw();
    } else {
      trRef.current?.nodes([]);
    }
  }, [selectedId]);

  const handleTransformEnd = (id: number) => {
    const node = shapeRefs.current.get(id);
    const updatedStores = stores.map((store) =>
      store.id === id
        ? {
            ...store,
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
            rotation: node.rotation(),
            x: node.x(),
            y: node.y()
          }
        : store
    );

    // Reset scale to 1
    const current = shapeRefs.current.get(id);
    current.scaleX(1);
    current.scaleY(1);

    setStores(updatedStores);
  };

  const handleDragEnd = (e: any, id: number) => {
    const node = e.target;
    const updatedStores = stores.map((store) =>
      store.id === id
        ? {
            ...store,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation()
          }
        : store
    );
    setStores(updatedStores);
  };

  const saveLayout = () => {
    localStorage.setItem(
      `market-layout-${selectedCanvasId}`,
      JSON.stringify(stores)
    );
    localStorage.setItem(
      `market-text-labels-${selectedCanvasId}`,
      JSON.stringify(textLabels)
    );
    localStorage.setItem(
      `market-drawings-${selectedCanvasId}`,
      JSON.stringify(lines)
    );
    alert('Layout saved!');
  };

  const saveStoreChanges = () => {
    localStorage.setItem(
      `market-layout-${selectedCanvasId}`,
      JSON.stringify(stores)
    );
    setIsDialogOpen(false);
  };

  const addStore = () => {
    const maxId = stores.reduce((max, store) => Math.max(max, store.id), 0);
    const newStore: Store = {
      id: maxId + 1,
      name: `Kiot ${String.fromCharCode(65 + stores.length)}`,
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      color: 'lightgray',
      shapeType: 'rect',
      rotation: 0,
      storeOwner: ''
    };
    setStores([...stores, newStore]);
    setSelectedId(newStore.id);
  };

  const deleteSelectedStore = () => {
    if (selectedId === null) return;
    const updated = stores.filter((store) => store.id !== selectedId);
    setStores(updated);
    setSelectedId(null);
  };

  const cloneSelectedStore = () => {
    if (selectedId === null) return;
    const selectedStore = stores.find((store) => store.id === selectedId);
    if (!selectedStore) return;

    const maxId = stores.reduce((max, store) => Math.max(max, store.id), 0);
    const newStore: Store = {
      ...selectedStore,
      id: maxId + 1,
      x: selectedStore.x + 20, // Offset by 20 pixels
      y: selectedStore.y + 20
    };
    setStores([...stores, newStore]);
    setSelectedId(newStore.id);
  };

  const updateShapeType = (newShape: ShapeType) => {
    if (selectedId === null) return;

    // First update the store
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, shapeType: newShape } : store
    );
    setStores(updated);

    // Temporarily clear the transformer
    trRef.current?.nodes([]);

    // Force a re-render of the transformer with the new shape
    setTimeout(() => {
      if (trRef.current && shapeRefs.current.has(selectedId)) {
        trRef.current.nodes([shapeRefs.current.get(selectedId)]);
        trRef.current.getLayer().batchDraw();
      }
    }, 0);
  };

  const updateStoreColor = (newColor: string) => {
    if (selectedId === null) return;
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, color: newColor } : store
    );
    setStores(updated);
  };

  const updateStoreName = (newName: string) => {
    if (selectedId === null) return;
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, name: newName } : store
    );
    setStores(updated);
  };

  const updateStoreOwner = (newOwner: string) => {
    if (selectedId === null) return;
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, storeOwner: newOwner } : store
    );
    setStores(updated);
  };

  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    // Prevent zooming while in drawing mode
    if (isDrawingMode) {
      return;
    }

    const stage = stageRef.current;
    const oldScale = stage.scaleX();

    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * 1.1 : oldScale / 1.1;

    // Prevent zooming out beyond original size
    if (newScale < 1) return;

    setScale(newScale);

    // Center the zoom
    const center = {
      x: stage.width() / 2,
      y: stage.height() / 2
    };

    const newPos = {
      x: center.x - (center.x - position.x) * (newScale / oldScale),
      y: center.y - (center.y - position.y) * (newScale / oldScale)
    };

    // Calculate boundaries
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const scaledWidth = stageWidth * newScale;
    const scaledHeight = stageHeight * newScale;

    // Calculate maximum allowed position
    const maxX = 0;
    const maxY = 0;
    const minX = stageWidth - scaledWidth;
    const minY = stageHeight - scaledHeight;

    // Constrain the position within boundaries
    newPos.x = Math.min(maxX, Math.max(minX, newPos.x));
    newPos.y = Math.min(maxY, Math.max(minY, newPos.y));

    setPosition(newPos);
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const handleMouseDown = (e: any) => {
    if (isDrawingMode) {
      const pos = e.target.getStage().getPointerPosition();

      if (tool === 'straight') {
        if (!startPoint) {
          // First click - set start point
          setStartPoint({ x: pos.x, y: pos.y });
          setTempLine({
            tool,
            points: [pos.x, pos.y, pos.x, pos.y],
            strokeWidth: brushSize,
            id: Date.now()
          });
        } else {
          // Second click - create the line
          setLines([
            ...lines,
            {
              tool,
              points: [startPoint.x, startPoint.y, pos.x, pos.y],
              strokeWidth: brushSize,
              id: Date.now()
            }
          ]);
          setStartPoint(null);
          setTempLine(null);
        }
      } else {
        // Free drawing or eraser
        setIsDrawing(true);
        setLines([
          ...lines,
          {
            tool,
            points: [pos.x, pos.y],
            strokeWidth: brushSize,
            id: Date.now()
          }
        ]);
      }
    } else if (e.target === e.target.getStage()) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDrawingMode) {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();

      if (tool === 'straight' && startPoint) {
        // Update temporary line while moving mouse
        setTempLine({
          tool,
          points: [startPoint.x, startPoint.y, point.x, point.y],
          strokeWidth: brushSize
        });
      } else if (isDrawing && tool !== 'straight') {
        // Free drawing or eraser
        let lastLine = lines[lines.length - 1];
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        lines.splice(lines.length - 1, 1, lastLine);
        setLines([...lines]);
      }
    } else if (isDragging) {
      const stage = stageRef.current;
      const newPos = {
        x: stage.x() + e.evt.movementX,
        y: stage.y() + e.evt.movementY
      };

      // Calculate boundaries
      const stageWidth = stage.width();
      const stageHeight = stage.height();
      const scaledWidth = stageWidth * scale;
      const scaledHeight = stageHeight * scale;

      // Calculate maximum allowed position
      const maxX = 0;
      const maxY = 0;
      const minX = stageWidth - scaledWidth;
      const minY = stageHeight - scaledHeight;

      // Constrain the position within boundaries
      newPos.x = Math.min(maxX, Math.max(minX, newPos.x));
      newPos.y = Math.min(maxY, Math.max(minY, newPos.y));

      setPosition(newPos);
      stage.position(newPos);
      stage.batchDraw();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  const selectedStore = stores.find((s) => s.id === selectedId);

  const addText = () => {
    const maxId = Math.max(
      ...textLabels.map((label) => label.id),
      ...stores.map((store) => store.id),
      0
    );
    const newText: TextLabel = {
      id: maxId + 1,
      text: 'New Text',
      x: 100,
      y: 100,
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000'
    };
    setTextLabels([...textLabels, newText]);
    setSelectedTextId(newText.id);
  };

  const updateText = (id: number, newText: string) => {
    const updated = textLabels.map((label) =>
      label.id === id ? { ...label, text: newText } : label
    );
    setTextLabels(updated);
  };

  const deleteSelectedText = () => {
    if (selectedTextId === null) return;
    const updated = textLabels.filter((label) => label.id !== selectedTextId);
    setTextLabels(updated);
    setSelectedTextId(null);
  };

  const handleTextDragEnd = (e: any, id: number) => {
    const node = e.target;
    const updated = textLabels.map((label) =>
      label.id === id
        ? {
            ...label,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation()
          }
        : label
    );
    setTextLabels(updated);
  };

  useEffect(() => {
    if (
      selectedTextId !== null &&
      textTrRef.current &&
      textRefs.current.has(selectedTextId)
    ) {
      textTrRef.current.nodes([textRefs.current.get(selectedTextId)]);
      textTrRef.current.getLayer().batchDraw();
    } else {
      textTrRef.current?.nodes([]);
    }
  }, [selectedTextId]);

  const selectedText = textLabels.find((t) => t.id === selectedTextId);

  const handleTextTransformEnd = (id: number) => {
    const node = textRefs.current.get(id);
    const updated = textLabels.map((label) =>
      label.id === id
        ? {
            ...label,
            fontSize: node.fontSize(),
            rotation: node.rotation(),
            x: node.x(),
            y: node.y()
          }
        : label
    );
    setTextLabels(updated);
  };

  const resetZoom = () => {
    const stage = stageRef.current;
    setScale(1);
    setPosition({ x: 0, y: 0 });
    stage.scale({ x: 1, y: 1 });
    stage.position({ x: 0, y: 0 });
    stage.batchDraw();
  };

  return (
    <div className='p-4'>
      <div className='flex flex-col gap-4 mb-4'>
        <h1 className='text-2xl font-bold text-red-500'>Bản đồ chợ Di Linh</h1>
        <div className='space-y-4'>
          <Select
            value={selectedCanvasId.toString()}
            onValueChange={(value) => setSelectedCanvasId(parseInt(value))}
          >
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='Chọn khu vực' />
            </SelectTrigger>
            <SelectContent>
              {CANVASES.map((canvas) => (
                <SelectItem key={canvas.id} value={canvas.id.toString()}>
                  {canvas.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='flex gap-4'>
            <Select
              value={tool}
              onValueChange={(value) => {
                setTool(value);
                setStartPoint(null);
                setTempLine(null);
              }}
            >
              <SelectTrigger className='w-[200px]'>
                <SelectValue placeholder='Chọn công cụ' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='brush'>Bút vẽ</SelectItem>
                <SelectItem value='straight'>Đường thẳng</SelectItem>
                <SelectItem value='eraser'>Xóa</SelectItem>
              </SelectContent>
            </Select>
            <div className='flex items-center gap-2'>
              <span className='text-sm'>Kích thước:</span>
              <Input
                type='number'
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                min={1}
                max={20}
                className='w-16'
              />
            </div>
            <Button
              variant={isDrawingMode ? 'default' : 'secondary'}
              onClick={() => {
                if (!isDrawingMode) {
                  resetZoom();
                }
                setStartPoint(null);
                setTempLine(null);
                setIsDrawingMode(!isDrawingMode);
              }}
            >
              {isDrawingMode ? 'Thoát chế độ vẽ' : 'Chế độ vẽ'}
            </Button>
          </div>
        </div>
      </div>
      <div className='flex flex-row gap-4 mt-4'>
        <Card className='w-80'>
          <CardHeader>
            <CardTitle>🛍️ Thao tác</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {selectedStore ? (
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium'>Mã số</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedStore.id}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Tên</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedStore.name}
                  </p>
                </div>

                <div>
                  <p className='text-sm font-medium mb-2'>Hình dạng</p>
                  <Select
                    value={selectedStore.shapeType}
                    onValueChange={(value) =>
                      updateShapeType(value as ShapeType)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Chọn hình dạng' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='rect'>Hình chữ nhật</SelectItem>
                      <SelectItem value='rounded'>Hình bo tròn</SelectItem>
                      <SelectItem value='circle'>Hình tròn</SelectItem>
                      <SelectItem value='ellipse'>Hình elip</SelectItem>
                      <SelectItem value='hexagon'>Hình lục giác</SelectItem>
                      <SelectItem value='triangle'>Hình tam giác</SelectItem>
                      <SelectItem value='diamond'>Hình thoi</SelectItem>
                      <SelectItem value='custom1'>Hình đa giác 1</SelectItem>
                      <SelectItem value='custom2'>Hình đa giác 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <p className='text-sm font-medium mb-2'>Màu sắc</p>
                  <div className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={selectedStore.color}
                      onChange={(e) => updateStoreColor(e.target.value)}
                      className='w-10 h-10 rounded cursor-pointer'
                    />
                    <span className='text-sm text-muted-foreground'>
                      {selectedStore.color}
                    </span>
                  </div>
                </div>

                <div>
                  <p className='text-sm font-medium'>Vị trí</p>
                  <p className='text-sm text-muted-foreground'>
                    X: {selectedStore.x}, Y: {selectedStore.y}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Kích thước</p>
                  <p className='text-sm text-muted-foreground'>
                    Rộng: {selectedStore.width}, Cao: {selectedStore.height}
                  </p>
                </div>
              </div>
            ) : (
              <p className='text-sm text-muted-foreground italic'>
                Nhấp vào gian hàng để chọn
              </p>
            )}

            <div className='space-y-2 pt-4'>
              <Button variant='default' className='w-full' onClick={addStore}>
                ➕ Thêm gian hàng
              </Button>
              <Button variant='default' className='w-full' onClick={addText}>
                📝 Thêm chữ
              </Button>
              <Button
                variant='secondary'
                className='w-full'
                onClick={cloneSelectedStore}
                disabled={selectedId === null}
              >
                📋 Nhân bản
              </Button>
              <Button
                variant='destructive'
                className='w-full'
                onClick={
                  selectedTextId !== null
                    ? deleteSelectedText
                    : deleteSelectedStore
                }
              >
                🗑️ Xóa
              </Button>
              <Button
                variant='secondary'
                className='w-full'
                onClick={saveLayout}
              >
                💾 Lưu bản đồ
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className='w-[1280px] h-[720px] border border-border rounded-lg shadow-md'>
          <Stage
            width={1280}
            height={720}
            className='bg-gray-100'
            ref={stageRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
            draggable={false}
          >
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={line.points}
                  stroke='#000000'
                  strokeWidth={line.strokeWidth}
                  tension={0.5}
                  lineCap='round'
                  lineJoin='round'
                  globalCompositeOperation={
                    line.tool === 'eraser' ? 'destination-out' : 'source-over'
                  }
                />
              ))}
              {tempLine && (
                <Line
                  points={tempLine.points}
                  stroke='#000000'
                  strokeWidth={tempLine.strokeWidth}
                  tension={0.5}
                  lineCap='round'
                  lineJoin='round'
                  globalCompositeOperation='source-over'
                />
              )}
              {stores.map((store) => (
                <React.Fragment key={store.id}>
                  {renderShape(store, {
                    draggable: true,
                    onClick: () => {
                      setSelectedId(store.id);
                      setSelectedTextId(null);
                    },
                    onDblClick: () => {
                      setSelectedId(store.id);
                      setIsDialogOpen(true);
                    },
                    onDragEnd: (e) => handleDragEnd(e, store.id),
                    onTransformEnd: () => handleTransformEnd(store.id),
                    rotation: store.rotation,
                    ref: (node) => {
                      if (node) shapeRefs.current.set(store.id, node);
                    }
                  })}
                </React.Fragment>
              ))}
              {textLabels.map((label) =>
                renderText(label, {
                  draggable: true,
                  onClick: () => {
                    setSelectedTextId(label.id);
                    setSelectedId(null);
                  },
                  onDblClick: () => {
                    setSelectedTextId(label.id);
                    setIsTextDialogOpen(true);
                  },
                  onDragEnd: (e) => handleTextDragEnd(e, label.id),
                  onTransformEnd: () => handleTextTransformEnd(label.id),
                  ref: (node) => {
                    if (node) textRefs.current.set(label.id, node);
                  }
                })
              )}
              <Transformer ref={trRef} />
              <Transformer ref={textTrRef} />
            </Layer>
          </Stage>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thông tin gian hàng</DialogTitle>
            </DialogHeader>
            {selectedStore && (
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium mb-2'>Tên</p>
                  <Input
                    value={selectedStore.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateStoreName(e.target.value)
                    }
                    placeholder='Nhập tên gian hàng'
                  />
                </div>
                <div>
                  <p className='text-sm font-medium mb-2'>Chủ cửa hàng</p>
                  <Input
                    value={selectedStore.storeOwner}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateStoreOwner(e.target.value)
                    }
                    placeholder='Nhập tên chủ cửa hàng'
                  />
                </div>
              </div>
            )}
            <DialogFooter className='gap-2'>
              <Button variant='default' onClick={saveStoreChanges}>
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isTextDialogOpen} onOpenChange={setIsTextDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chỉnh sửa chữ</DialogTitle>
            </DialogHeader>
            {selectedText && (
              <div className='space-y-4'>
                <div>
                  <p className='text-sm font-medium mb-2'>Nội dung</p>
                  <Input
                    value={selectedText.text}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateText(selectedText.id, e.target.value)
                    }
                    placeholder='Nhập nội dung'
                  />
                </div>
                <div>
                  <p className='text-sm font-medium mb-2'>Kích thước chữ</p>
                  <Input
                    type='number'
                    value={selectedText.fontSize}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const updated = textLabels.map((label) =>
                        label.id === selectedText.id
                          ? {
                              ...label,
                              fontSize: parseInt(e.target.value) || 20
                            }
                          : label
                      );
                      setTextLabels(updated);
                    }}
                    min='8'
                    max='72'
                  />
                </div>
                <div>
                  <p className='text-sm font-medium mb-2'>Màu chữ</p>
                  <div className='flex items-center gap-2'>
                    <input
                      type='color'
                      value={selectedText.fill}
                      onChange={(e) => {
                        const updated = textLabels.map((label) =>
                          label.id === selectedText.id
                            ? { ...label, fill: e.target.value }
                            : label
                        );
                        setTextLabels(updated);
                      }}
                      className='w-10 h-10 rounded cursor-pointer'
                    />
                    <span className='text-sm text-muted-foreground'>
                      {selectedText.fill}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className='gap-2'>
              <Button
                variant='default'
                onClick={() => setIsTextDialogOpen(false)}
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MarketMap;
