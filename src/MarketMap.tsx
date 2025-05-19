import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Ellipse, Transformer } from 'react-konva';
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
  rotation: number;
  storeOwner: string;
}

const MarketMap: React.FC = () => {
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem('market-layout');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
            height: node.height() * node.scaleY(),
            rotation: node.rotation()
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

  const saveStoreChanges = () => {
    localStorage.setItem('market-layout', JSON.stringify(stores));
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

  const updateShapeType = (newShape: ShapeType) => {
    if (selectedId === null) return;
    const updated = stores.map((store) =>
      store.id === selectedId ? { ...store, shapeType: newShape } : store
    );
    setStores(updated);
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

  const renderShape = (store: Store) => {
    const commonProps = {
      key: store.id,
      draggable: true,
      onClick: () => setSelectedId(store.id),
      onDblClick: () => {
        setSelectedId(store.id);
        setIsDialogOpen(true);
      },
      onDragEnd: (e: any) => handleDragEnd(e, store.id),
      onTransformEnd: () => handleTransformEnd(store.id),
      rotation: store.rotation
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
    <div className='p-4'>
      <h1 className='text-2xl font-bold text-red-500'>Bản đồ chợ Di Linh</h1>
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
              <Button
                variant='destructive'
                className='w-full'
                onClick={deleteSelectedStore}
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
          <Stage width={1280} height={720} className='bg-gray-100'>
            <Layer>
              {stores.map((store) => (
                <React.Fragment key={store.id}>
                  {renderShape(store)}
                  {/* {store.shapeType === 'rect' || store.shapeType === 'rounded' ? (
                  <Text
                    x={store.x + 10}
                    y={store.y + 30}
                    text={store.name}
                    fontSize={14}
                    fill='black'
                  />
                ) : null} */}
                </React.Fragment>
              ))}
              <Transformer ref={trRef} />
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
      </div>
    </div>
  );
};

export default MarketMap;
