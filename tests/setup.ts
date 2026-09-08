import '@testing-library/jest-dom/vitest'

const mockLocalStorage = {
  _data: {} as Record<string, string>,
  getItem(key: string) {
    return this._data[key] || null
  },
  setItem(key: string, value: string) {
    this._data[key] = value
  },
  removeItem(key: string) {
    delete this._data[key]
  },
  clear() {
    this._data = {}
  },
  get length() {
    return Object.keys(this._data).length
  },
  key(index: number) {
    return Object.keys(this._data)[index] || null
  },
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
})
