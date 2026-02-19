import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { estimatesApi } from '@/api/estimates';
import { useCarList } from '@/hooks/useCar';

export function JudgePhoto() {
  const navigate = useNavigate();
  const { data: cars } = useCarList();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [shopName, setShopName] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 타입 확인
      const allowedTypes = ['image/jpeg', 'image/png', 'image/heic'];
      if (!allowedTypes.includes(file.type)) {
        setError('지원하지 않는 파일 형식입니다. JPG, PNG, HEIC만 가능합니다.');
        return;
      }
      // 파일 크기 확인 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('파일 크기가 너무 큽니다. 최대 5MB까지 가능합니다.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await estimatesApi.uploadPhoto(selectedFile, selectedCarId || undefined, shopName || undefined);
      // 업로드 성공 후, 견적 상세 페이지로 이동
      navigate(`/judge/review/${result.estimate.id}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('업로드 중 오류가 발생했습니다.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">사진으로 견적 입력</h1>
        <p className="text-sm text-gray-500 mt-1">견적서 사진을 업로드하면 자동으로 분석합니다</p>
      </div>

      <Card className="p-6">
        {/* 차량 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            차량 선택 (선택사항)
          </label>
          <select
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">선택 안함</option>
            {cars?.map((car) => (
              <option key={car.id} value={car.id}>
                {car.year} {car.make} {car.model} {car.plateNo && `(${car.plateNo})`}
              </option>
            ))}
          </select>
        </div>

        {/* 정비소 이름 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정비소 이름 (선택사항)
          </label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="예: A 정비소"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 파일 업로드 영역 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            견적서 사진
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/jpeg,image/png,image/heic"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              {selectedFile ? (
                <div>
                  <div className="text-green-600 text-2xl mb-2">✅</div>
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">📷</div>
                  <p className="text-sm text-gray-600 mb-1">사진을 선택하려면 클릭하세요</p>
                  <p className="text-xs text-gray-500">JPG, PNG, HEIC 지원 (최대 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex flex-col gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            fullWidth
          >
            {isUploading ? '업로드 중...' : '사진 업로드 및 분석'}
          </Button>
          <Button onClick={() => navigate('/judge/manual')} variant="ghost" fullWidth>
            직접 입력으로 전환
          </Button>
          <Button variant="ghost" onClick={() => navigate('/judge/new')} fullWidth>
            돌아가기
          </Button>
        </div>
      </Card>
    </div>
  );
}
