import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}





const createAnimationStep = (type: string, indices: number[], array?: number[]) => {
  return { type, indices, array: array ? [...array] : undefined }
}

const ensurePairComparison = (
  animations: { type: string; indices: number[]; array?: number[] }[],
  indices: number[],
) => {
  // Make sure we have exactly two indices for comparison arrows
  if (indices.length === 2 && Math.abs(indices[0] - indices[1]) === 1) {
    animations.push(createAnimationStep("compare", [indices[0], indices[1]]))
  }
}

// Bubble Sort
export const bubbleSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Compare elements
      animations.push(createAnimationStep("compare", [j, j + 1]))

      // Add a small delay between comparison and swap for better visualization
      animations.push(createAnimationStep("compare", [j, j + 1]))

      if (arr[j] > arr[j + 1]) {
        // Swap elements
        animations.push(createAnimationStep("swap", [j, j + 1]))

        const temp = arr[j]
        arr[j] = arr[j + 1]
        arr[j + 1] = temp

        // Update array
        animations.push(createAnimationStep("update", [j, j + 1], arr))
      }
    }
  }

  return arr
}

// Selection Sort
export const selectionSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]
  const n = arr.length

  for (let i = 0; i < n - 1; i++) {
    let minIndex = i

    for (let j = i + 1; j < n; j++) {
      // Compare elements - make sure we're comparing adjacent elements for arrow visualization
      if (j === i + 1) {
        animations.push(createAnimationStep("compare", [i, j]))
      } else {
        animations.push(createAnimationStep("compare", [minIndex, j]))
      }

      if (arr[j] < arr[minIndex]) {
        minIndex = j
      }
    }

    if (minIndex !== i) {
      // Swap elements
      animations.push(createAnimationStep("swap", [i, minIndex]))

      const temp = arr[i]
      arr[i] = arr[minIndex]
      arr[minIndex] = temp

      // Update array
      animations.push(createAnimationStep("update", [i, minIndex], arr))
    }
  }

  return arr
}

// Insertion Sort
export const insertionSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]
  const n = arr.length

  for (let i = 1; i < n; i++) {
    const key = arr[i]
    let j = i - 1

    // Compare elements
    animations.push(createAnimationStep("compare", [i, j]))

    while (j >= 0 && arr[j] > key) {
      // Swap elements
      animations.push(createAnimationStep("swap", [j, j + 1]))

      arr[j + 1] = arr[j]
      j--

      // Update array
      animations.push(createAnimationStep("update", [j + 1, j + 2], arr))

      if (j >= 0) {
        // Compare next elements
        animations.push(createAnimationStep("compare", [i, j]))
      }
    }

    arr[j + 1] = key

    // Update array
    animations.push(createAnimationStep("update", [j + 1], arr))
  }

  return arr
}

// Merge Sort
export const mergeSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]

  if (arr.length <= 1) return arr

  const auxiliaryArray = [...arr]
  mergeSortHelper(arr, 0, arr.length - 1, auxiliaryArray, animations)

  return arr
}

const mergeSortHelper = (
  mainArray: number[],
  startIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: { type: string; indices: number[]; array?: number[] }[],
) => {
  if (startIdx === endIdx) return

  const middleIdx = Math.floor((startIdx + endIdx) / 2)

  mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations)
  mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations)

  doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations)
}

const doMerge = (
  mainArray: number[],
  startIdx: number,
  middleIdx: number,
  endIdx: number,
  auxiliaryArray: number[],
  animations: { type: string; indices: number[]; array?: number[] }[],
) => {
  let k = startIdx
  let i = startIdx
  let j = middleIdx + 1

  while (i <= middleIdx && j <= endIdx) {
    // Compare elements
    animations.push(createAnimationStep("compare", [i, j]))

    if (auxiliaryArray[i] <= auxiliaryArray[j]) {
      // Update element
      animations.push(createAnimationStep("swap", [k]))

      mainArray[k] = auxiliaryArray[i]
      i++
    } else {
      // Update element
      animations.push(createAnimationStep("swap", [k]))

      mainArray[k] = auxiliaryArray[j]
      j++
    }

    // Update array
    animations.push(createAnimationStep("update", [k], mainArray))
    k++
  }

  while (i <= middleIdx) {
    // Update element
    animations.push(createAnimationStep("swap", [k]))

    mainArray[k] = auxiliaryArray[i]
    i++
    k++

    // Update array
    animations.push(createAnimationStep("update", [k - 1], mainArray))
  }

  while (j <= endIdx) {
    // Update element
    animations.push(createAnimationStep("swap", [k]))

    mainArray[k] = auxiliaryArray[j]
    j++
    k++

    // Update array
    animations.push(createAnimationStep("update", [k - 1], mainArray))
  }
}

// Quick Sort
export const quickSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]

  quickSortHelper(arr, 0, arr.length - 1, animations)

  return arr
}

const quickSortHelper = (
  arr: number[],
  low: number,
  high: number,
  animations: { type: string; indices: number[]; array?: number[] }[],
) => {
  if (low < high) {
    const partitionIndex = partition(arr, low, high, animations)

    quickSortHelper(arr, low, partitionIndex - 1, animations)
    quickSortHelper(arr, partitionIndex + 1, high, animations)
  }
}

const partition = (
  arr: number[],
  low: number,
  high: number,
  animations: { type: string; indices: number[]; array?: number[] }[],
) => {
  const pivot = arr[high]
  let i = low - 1

  for (let j = low; j < high; j++) {
    // Compare elements
    animations.push(createAnimationStep("compare", [j, high]))

    if (arr[j] <= pivot) {
      i++

      // Swap elements
      animations.push(createAnimationStep("swap", [i, j]))

      const temp = arr[i]
      arr[i] = arr[j]
      arr[j] = temp

      // Update array
      animations.push(createAnimationStep("update", [i, j], arr))
    }
  }

  // Swap elements
  animations.push(createAnimationStep("swap", [i + 1, high]))

  const temp = arr[i + 1]
  arr[i + 1] = arr[high]
  arr[high] = temp

  // Update array
  animations.push(createAnimationStep("update", [i + 1, high], arr))

  return i + 1
}

// Heap Sort
export const heapSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]
  const n = arr.length

  // Build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i, animations)
  }

  // Extract elements from heap one by one
  for (let i = n - 1; i > 0; i--) {
    // Swap elements
    animations.push(createAnimationStep("swap", [0, i]))

    const temp = arr[0]
    arr[0] = arr[i]
    arr[i] = temp

    // Update array
    animations.push(createAnimationStep("update", [0, i], arr))

    // Call heapify on the reduced heap
    heapify(arr, i, 0, animations)
  }

  return arr
}

const heapify = (
  arr: number[],
  n: number,
  i: number,
  animations: { type: string; indices: number[]; array?: number[] }[],
) => {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2

  // Compare with left child
  if (left < n) {
    animations.push(createAnimationStep("compare", [largest, left]))

    if (arr[left] > arr[largest]) {
      largest = left
    }
  }

  // Compare with right child
  if (right < n) {
    animations.push(createAnimationStep("compare", [largest, right]))

    if (arr[right] > arr[largest]) {
      largest = right
    }
  }

  // If largest is not root
  if (largest !== i) {
    // Swap elements
    animations.push(createAnimationStep("swap", [i, largest]))

    const temp = arr[i]
    arr[i] = arr[largest]
    arr[largest] = temp

    // Update array
    animations.push(createAnimationStep("update", [i, largest], arr))

    // Recursively heapify the affected sub-tree
    heapify(arr, n, largest, animations)
  }
}

// Counting Sort
export const countingSort = (array: number[], animations: { type: string; indices: number[]; array?: number[] }[]) => {
  const arr = [...array]
  const n = arr.length

  // Find the maximum element
  let max = arr[0]
  for (let i = 1; i < n; i++) {
    animations.push(createAnimationStep("compare", [0, i]))

    if (arr[i] > max) {
      max = arr[i]
    }
  }

  // Create count array
  const count = new Array(max + 1).fill(0)

  // Store count of each element
  for (let i = 0; i < n; i++) {
    animations.push(createAnimationStep("compare", [i]))

    count[arr[i]]++
  }

  // Change count[i] so that count[i] contains actual position of this element in output array
  for (let i = 1; i <= max; i++) {
    count[i] += count[i - 1]
  }

  // Build the output array
  const output = new Array(n).fill(0)

  for (let i = n - 1; i >= 0; i--) {
    animations.push(createAnimationStep("swap", [i]))

    output[count[arr[i]] - 1] = arr[i]
    count[arr[i]]--

    // Update the original array
    arr[count[arr[i]]] = output[count[arr[i]]]

    // Update array visualization
    const newArr = [...arr]
    for (let j = 0; j < n; j++) {
      if (j < n - i) {
        newArr[j] = output[j]
      }
    }

    animations.push(createAnimationStep("update", [i], newArr))
  }

  // Copy the output array to the original array
  for (let i = 0; i < n; i++) {
    animations.push(createAnimationStep("swap", [i]))

    arr[i] = output[i]

    animations.push(createAnimationStep("update", [i], arr))
  }

  return arr
}
