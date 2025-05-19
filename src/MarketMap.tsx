import React, { useEffect, useRef, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Ellipse,
  Text,
  Transformer
} from 'react-konva';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './components/ui/select';

type ShapeType = 'rect' | 'rounded' | 'circle' | 'ellipse';

interface Store {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shapeType: ShapeType;
}

const defaultStores: Store[] = [
  {
    id: 1,
    name: 'Store A',
    x: 50,
    y: 50,
    width: 100,
    height: 80,
    color: 'lightblue',
    shapeType: 'rect'
  },
  {
    id: 2,
    name: 'Store B',
    x: 200,
    y: 50,
    width: 120,
    height: 80,
    color: 'lightgreen',
    shapeType: 'circle'
  },
  {
    id: 3,
    name: 'Store C',
    x: 350,
    y: 50,
    width: 100,
    height: 80,
    color: 'lightcoral',
    shapeType: 'ellipse'
  }
];

const MarketMap: React.FC = () => {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('market-layout');
    return saved ? JSON.parse(saved) : defaultStores;
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const trRef = useRef<any>(null);
  const shapeRefs = useRef<Map<number, any>>(new Map());

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
            height: node.height() * node.scaleY()
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
    const updatedStores = stores.map((store) =>
      store.id === id ? { ...store, x: e.target.x(), y: e.target.y() } : store
    );
    setStores(updatedStores);
  };

  const saveLayout = () => {
    localStorage.setItem('market-layout', JSON.stringify(stores));
    alert('Layout saved!');
  };

  const addStore = () => {
    const maxId = stores.reduce((max, store) => Math.max(max, store.id), 0);
    const newStore: Store = {
      id: maxId + 1,
      name: `Store ${String.fromCharCode(65 + stores.length)}`,
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      color: 'lightgray',
      shapeType: 'rect'
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

  const updateShapeType = (newShape: ShapeType) => {
    if (selectedId === null) return;
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, shapeType: newShape } : store
    );
    setStores(updated);
  };

  const renderShape = (store: Store) => {
    const commonProps = {
      key: store.id,
      draggable: true,
      onClick: () => setSelectedId(store.id),
      onDragEnd: (e: any) => handleDragEnd(e, store.id),
      onTransformEnd: () => handleTransformEnd(store.id)
    };

    switch (store.shapeType) {
      case 'circle':
        return (
          <Circle
            {...commonProps}
            ref={(node) => {
              if (node) shapeRefs.current.set(store.id, node);
            }}
            x={store.x}
            y={store.y}
            radius={Math.min(store.width, store.height) / 2}
            fill={store.color}
          />
        );
      case 'ellipse':
        return (
          <Ellipse
            {...commonProps}
            ref={(node) => {
              if (node) shapeRefs.current.set(store.id, node);
            }}
            x={store.x}
            y={store.y}
            radiusX={store.width / 2}
            radiusY={store.height / 2}
            fill={store.color}
          />
        );
      case 'rounded':
        return (
          <Rect
            {...commonProps}
            ref={(node) => {
              if (node) shapeRefs.current.set(store.id, node);
            }}
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
            {...commonProps}
            ref={(node) => {
              if (node) shapeRefs.current.set(store.id, node);
            }}
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

  const selectedStore = stores.find((s) => s.id === selectedId);

  return (
    <div className='flex p-4 gap-4'>
      <Stage
        width={800}
        height={500}
        className='border border-border rounded-lg shadow-md'
      >
        <Layer>
          {stores.map((store) => (
            <React.Fragment key={store.id}>
              {renderShape(store)}
              {store.shapeType === 'rect' || store.shapeType === 'rounded' ? (
                <Text
                  x={store.x + 10}
                  y={store.y + 30}
                  text={store.name}
                  fontSize={14}
                  fill='black'
                />
              ) : null}
            </React.Fragment>
          ))}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>

      <Card className='w-80'>
        <CardHeader>
          <CardTitle>🛍️ Store Info</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {selectedStore ? (
            <div className='space-y-4'>
              <div>
                <p className='text-sm font-medium'>Name</p>
                <p className='text-sm text-muted-foreground'>
                  {selectedStore.name}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium'>ID</p>
                <p className='text-sm text-muted-foreground'>
                  {selectedStore.id}
                </p>
              </div>
              <div>
                <p className='text-sm font-medium mb-2'>Shape</p>
                <Select
                  value={selectedStore.shapeType}
                  onValueChange={(value) => updateShapeType(value as ShapeType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select shape' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='rect'>Rectangle</SelectItem>
                    <SelectItem value='rounded'>Rounded</SelectItem>
                    <SelectItem value='circle'>Circle</SelectItem>
                    <SelectItem value='ellipse'>Ellipse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant='destructive'
                className='w-full'
                onClick={deleteSelectedStore}
              >
                🗑️ Delete
              </Button>
            </div>
          ) : (
            <p className='text-sm text-muted-foreground italic'>
              Click a store to select
            </p>
          )}

          <div className='space-y-2 pt-4'>
            <Button variant='default' className='w-full' onClick={addStore}>
              ➕ Add Store
            </Button>
            <Button variant='secondary' className='w-full' onClick={saveLayout}>
              💾 Save Layout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketMap;
