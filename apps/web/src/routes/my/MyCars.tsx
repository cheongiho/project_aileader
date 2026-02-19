import { useState } from 'react';
import { useCarList, useCreateCar } from '@/hooks/useCar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { getSelectedCarId, setSelectedCarId } from '@/lib/storage';

export function MyCars() {
  const { data: cars, isLoading, error, refetch } = useCarList();
  const createCar = useCreateCar();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ make: '', model: '', year: new Date().getFullYear(), plateNo: '' });
  const selectedCarId = getSelectedCarId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCar.mutateAsync({
      make: form.make,
      model: form.model,
      year: form.year,
    });
    setShowForm(false);
    setForm({ make: '', model: '', year: new Date().getFullYear(), plateNo: '' });
  };

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorState message="차량 목록을 불러오지 못했습니다" onRetry={refetch} />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">내 차량</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? '취소' : '+ 차량 추가'}
        </Button>
      </div>

      {/* 차량 추가 폼 */}
      {showForm && (
        <Card className="mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">차량 등록</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="제조사"
                placeholder="예: 현대"
                value={form.make}
                onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                required
              />
              <Input
                label="모델명"
                placeholder="예: 아반떼"
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                required
              />
            </div>
            <Input
              label="연식"
              type="number"
              min={1980}
              max={new Date().getFullYear() + 1}
              value={form.year}
              onChange={(e) => setForm((f) => ({ ...f, year: parseInt(e.target.value) }))}
              required
            />
            <Button
              type="submit"
              fullWidth
              isLoading={createCar.isPending}
            >
              등록하기
            </Button>
          </form>
        </Card>
      )}

      {/* 차량 목록 */}
      {!cars || cars.length === 0 ? (
        <EmptyState
          icon="🚗"
          message="등록된 차량이 없습니다"
          description="차량을 등록하면 견적 판단 시 자동으로 연결됩니다."
          action={
            <Button onClick={() => setShowForm(true)}>차량 등록하기</Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {cars.map((car) => (
            <Card
              key={car.id}
              className={`cursor-pointer transition-all ${
                selectedCarId === car.id ? 'ring-2 ring-brand' : ''
              }`}
              onClick={() => setSelectedCarId(car.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {car.make} {car.model}
                  </p>
                  <p className="text-sm text-gray-500">{car.year}년형</p>
                  {car.plateNo && (
                    <p className="text-xs text-gray-400 mt-0.5">{car.plateNo}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedCarId === car.id && (
                    <span className="text-xs text-brand font-medium bg-brand-50 px-2 py-1 rounded-full">
                      선택됨
                    </span>
                  )}
                  <span className="text-gray-400">🚗</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
