import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AmountInput } from '@/components/ui/AmountInput';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { useCreateEstimate, useAddEstimateItem } from '@/hooks/useEstimate';
import { getSelectedCarId } from '@/lib/storage';
import { REPAIR_CATEGORIES } from '@aileader/shared';
import { estimatesApi } from '@/api/estimates';

const CATEGORY_OPTIONS = Object.entries(REPAIR_CATEGORIES).map(([value, meta]) => ({
  value,
  label: `${meta.icon} ${meta.label}`,
}));

const ItemSchema = z.object({
  name: z.string().min(1, '항목명을 입력하세요'),
  category: z.string().min(1, '카테고리를 선택하세요'),
  laborCost: z.number().nonnegative(),
  partsCost: z.number().nonnegative(),
  etcCost: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
});

const FormSchema = z.object({
  shopName: z.string().optional(),
  items: z.array(ItemSchema).min(1, '최소 1개 이상의 항목을 입력하세요'),
});

type FormData = z.infer<typeof FormSchema>;

export function JudgeManual() {
  const navigate = useNavigate();
  const createEstimate = useCreateEstimate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      shopName: '',
      items: [{ name: '', category: 'ETC', laborCost: 0, partsCost: 0, etcCost: 0, totalCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // totalCost 자동 계산
  const watchedItems = watch('items');
  useEffect(() => {
    watchedItems.forEach((item, index) => {
      const total = (item.laborCost || 0) + (item.partsCost || 0) + (item.etcCost || 0);
      setValue(`items.${index}.totalCost`, total, { shouldValidate: false });
    });
  }, [watchedItems.map((i) => `${i.laborCost}-${i.partsCost}-${i.etcCost}`).join(',')]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const carId = getSelectedCarId() ?? undefined;

      // 1. 견적 생성
      const estimate = await createEstimate.mutateAsync({
        carId,
        source: 'manual',
        shopName: data.shopName || undefined,
      });

      // 2. 각 항목 추가 (순차적으로)
      for (const item of data.items) {
        await estimatesApi.addItem(estimate.id, {
          name: item.name,
          category: item.category as Parameters<typeof estimatesApi.addItem>[1]['category'],
          laborCost: item.laborCost,
          partsCost: item.partsCost,
          totalCost: item.totalCost,
        });
      }

      navigate(`/judge/review/${estimate.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '견적 생성에 실패했습니다');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">견적 직접 입력</h1>
        <p className="text-sm text-gray-500 mt-1">정비소에서 받은 견적 항목을 입력해주세요</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 정비소 이름 */}
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">기본 정보</h2>
          <Input
            label="정비소 이름 (선택)"
            placeholder="예: 강남 정비센터"
            {...register('shopName')}
          />
        </Card>

        {/* 항목 목록 */}
        <div className="space-y-3">
          {fields.map((field, index) => {
            const total = watchedItems[index]?.totalCost ?? 0;
            return (
              <Card key={field.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-sm">항목 {index + 1}</h3>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-xs text-excessive hover:text-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="항목명"
                      placeholder="예: 브레이크 패드"
                      error={errors.items?.[index]?.name?.message}
                      {...register(`items.${index}.name`)}
                    />
                    <Controller
                      name={`items.${index}.category`}
                      control={control}
                      render={({ field: f }) => (
                        <Select
                          label="카테고리"
                          options={CATEGORY_OPTIONS}
                          value={f.value}
                          onChange={f.onChange}
                          error={errors.items?.[index]?.category?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Controller
                      name={`items.${index}.laborCost`}
                      control={control}
                      render={({ field: f }) => (
                        <AmountInput
                          label="공임비"
                          value={f.value}
                          onChange={f.onChange}
                          placeholder="0"
                        />
                      )}
                    />
                    <Controller
                      name={`items.${index}.partsCost`}
                      control={control}
                      render={({ field: f }) => (
                        <AmountInput
                          label="부품비"
                          value={f.value}
                          onChange={f.onChange}
                          placeholder="0"
                        />
                      )}
                    />
                    <Controller
                      name={`items.${index}.etcCost`}
                      control={control}
                      render={({ field: f }) => (
                        <AmountInput
                          label="기타"
                          value={f.value}
                          onChange={f.onChange}
                          placeholder="0"
                        />
                      )}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-500">소계</span>
                    <span className="font-semibold text-gray-900">
                      {total.toLocaleString('ko-KR')}원
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {errors.items?.root?.message && (
          <p className="text-sm text-excessive">{errors.items.root.message}</p>
        )}

        {/* 항목 추가 버튼 */}
        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={() =>
            append({ name: '', category: 'ETC', laborCost: 0, partsCost: 0, etcCost: 0, totalCost: 0 })
          }
        >
          + 항목 추가
        </Button>

        {error && (
          <div className="p-3 bg-excessive-light border border-excessive-border rounded-lg text-sm text-excessive">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
          검수 화면으로 →
        </Button>
      </form>
    </div>
  );
}
