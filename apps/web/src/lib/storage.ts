const SELECTED_CAR_KEY = 'aileader_selected_car_id';

export function getSelectedCarId(): string | null {
  return localStorage.getItem(SELECTED_CAR_KEY);
}

export function setSelectedCarId(carId: string): void {
  localStorage.setItem(SELECTED_CAR_KEY, carId);
}

export function clearSelectedCarId(): void {
  localStorage.removeItem(SELECTED_CAR_KEY);
}
