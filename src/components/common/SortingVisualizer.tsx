"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  heapSort,
  countingSort,
} from "@/lib/utils"

const ComparisonArrow = ({
  fromIndex,
  toIndex,
  arrayLength,
  maxValue,
  array,
}: {
  fromIndex: number
  toIndex: number
  arrayLength: number
  maxValue: number
  array: number[]
}) => {
  // Only render if indices are valid
  if (fromIndex < 0 || toIndex < 0 || fromIndex >= array.length || toIndex >= array.length) {
    return null
  }

  const barWidth = Math.max(100 / arrayLength, 2)

  // Calculate positions based on the indices
  const fromPos = fromIndex * barWidth + barWidth / 2
  const toPos = toIndex * barWidth + barWidth / 2

  // Calculate heights based on values
  const fromHeight = (array[fromIndex] / maxValue) * 100
  const toHeight = (array[toIndex] / maxValue) * 100

  // Determine if we need to draw a direct or curved arrow
  const isAdjacent = Math.abs(fromIndex - toIndex) === 1

  if (isAdjacent) {
    // For adjacent elements, draw a simple arrow below
    return (
      <div
        className="absolute bottom-0 flex items-center justify-center"
        style={{
          left: `${Math.min(fromPos, toPos)}%`,
          width: `${barWidth}%`,
          height: "24px",
          transform: "translateY(100%)",
        }}
      >
        <div className="text-yellow-500 text-xl font-bold animate-pulse">{fromIndex < toIndex ? "→" : "←"}</div>
      </div>
    )
  } else {
    // For non-adjacent elements, draw a curved arrow (simplified)
    return (
      <div
        className="absolute bottom-0 flex items-center justify-center text-yellow-500 text-lg font-bold animate-pulse"
        style={{
          left: `${Math.min(fromPos, toPos)}%`,
          width: `${Math.abs(toPos - fromPos)}%`,
          height: "30px",
          transform: "translateY(100%)",
        }}
      >
        ↔
      </div>
    )
  }
}

export default function SortingVisualizer() {

  const [array, setArray] = useState<number[]>([])
  const [sortingAlgorithm, setSortingAlgorithm] = useState<string>("bubble")
  const [arraySize, setArraySize] = useState<number>(50)
  const [speed, setSpeed] = useState<number>(50)
  const [isSorting, setIsSorting] = useState<boolean>(false)
  const [isSorted, setIsSorted] = useState<boolean>(false)
  const [currentStep, setCurrentStep] = useState<number[]>([])
  const [comparingIndices, setComparingIndices] = useState<number[]>([])
  const [swappingIndices, setSwappingIndices] = useState<number[]>([])
  const [customInput, setCustomInput] = useState<string>("")
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Generate a random array
  const generateRandomArray = () => {
    if (isSorting) return

    const newArray = []
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.floor(Math.random() * 100) + 1)
    }
    setArray(newArray)
    setIsSorted(false)
    resetVisualState()
  }

  // Handle custom input
  const handleCustomInput = () => {
    if (isSorting) return

    try {
      const inputArray = customInput
        .split(",")
        .map((num) => Number.parseInt(num.trim()))
        .filter((num) => !isNaN(num))

      if (inputArray.length > 0) {
        setArray(inputArray)
        setIsSorted(false)
        resetVisualState()
      }
    } catch (error) {
      console.error("Invalid input:", error)
    }
  }

  // Reset visual state
  const resetVisualState = () => {
    setComparingIndices([])
    setSwappingIndices([])
    setCurrentStep([])
  }

  // Start sorting
  const startSorting = async () => {
    if (isSorting || isSorted || array.length === 0) return

    setIsSorting(true)
    resetVisualState()

    const animations: { type: string; indices: number[]; array?: number[] }[] = []
    const arrayCopy = [...array]

    // Get animations based on selected algorithm
    switch (sortingAlgorithm) {
      case "bubble":
        bubbleSort(arrayCopy, animations)
        break
      case "selection":
        selectionSort(arrayCopy, animations)
        break
      case "insertion":
        insertionSort(arrayCopy, animations)
        break
      case "merge":
        mergeSort(arrayCopy, animations)
        break
      case "quick":
        quickSort(arrayCopy, animations)
        break
      case "heap":
        heapSort(arrayCopy, animations)
        break
      case "counting":
        countingSort(arrayCopy, animations)
        break
      default:
        bubbleSort(arrayCopy, animations)
    }

    // Play animations
    const animationSpeed = 1000 - speed * 9 

    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i]

      await new Promise<void>((resolve) => {
        animationTimeoutRef.current = setTimeout(() => {
          if (animation.type === "compare") {
            setComparingIndices(animation.indices)
            setSwappingIndices([])
          } else if (animation.type === "swap") {
            // First show which elements are being swapped
            setComparingIndices([])
            setSwappingIndices(animation.indices)

            // Wait a moment to show the swap animation before updating the array
            setTimeout(() => {
              if (animation.array) {
                setArray([...animation.array])
                setCurrentStep([...animation.array])
              }
            }, animationSpeed * 0.4) // Delay the array update to make swap visible
          } else if (animation.type === "update" && animation.array) {
            // For non-swap updates, update immediately
            if (!swappingIndices.length) {
              setArray([...animation.array])
              setCurrentStep([...animation.array])
            }
          }

          resolve()
        }, animationSpeed)
      })
    }

    // Finish sorting
    setIsSorting(false)
    setIsSorted(true)
    setComparingIndices([])
    setSwappingIndices([])
  }

  // Stop sorting
  const stopSorting = () => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setIsSorting(false)
  }

  // Reset array
  const resetArray = () => {
    if (isSorting) {
      stopSorting()
    }
    generateRandomArray()
  }

  // Initialize array on component mount
  useEffect(() => {
    generateRandomArray()

    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  // Update array when size changes
  useEffect(() => {
    if (!isSorting) {
      generateRandomArray()
    }
  }, [arraySize])

  // Get the maximum value in the array for scaling
  const maxValue = Math.max(...array, 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="algorithm">Sorting Algorithm</Label>
            <Select value={sortingAlgorithm} onValueChange={setSortingAlgorithm} disabled={isSorting}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bubble">Bubble Sort</SelectItem>
                <SelectItem value="selection">Selection Sort</SelectItem>
                <SelectItem value="insertion">Insertion Sort</SelectItem>
                <SelectItem value="merge">Merge Sort</SelectItem>
                <SelectItem value="quick">Quick Sort</SelectItem>
                <SelectItem value="heap">Heap Sort</SelectItem>
                <SelectItem value="counting">Counting Sort</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="array-size">Array Size: {arraySize}</Label>
            <Slider
              id="array-size"
              min={5}
              max={100}
              step={1}
              value={[arraySize]}
              onValueChange={(value) => setArraySize(value[0])}
              disabled={isSorting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speed">Speed: {speed}</Label>
            <Slider
              id="speed"
              min={1}
              max={100}
              step={1}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-input">Custom Input (comma-separated)</Label>
            <div className="flex gap-2">
              <Input
                id="custom-input"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g., 64, 34, 25, 12, 22, 11, 90"
                disabled={isSorting}
              />
              <Button onClick={handleCustomInput} disabled={isSorting}>
                Set
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button onClick={startSorting} disabled={isSorting || array.length === 0}>
              Sort
            </Button>
            <Button onClick={stopSorting} disabled={!isSorting} variant="outline">
              Stop
            </Button>
            <Button onClick={resetArray} disabled={isSorting} variant="outline">
              Reset
            </Button>
            <Button onClick={generateRandomArray} disabled={isSorting} variant="outline">
              Random Array
            </Button>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Algorithm Information</h3>
            <div className="text-sm text-muted-foreground">
              {sortingAlgorithm === "bubble" && (
                <p>
                  <strong>Bubble Sort:</strong> Repeatedly steps through the list, compares adjacent elements, and swaps
                  them if they are in the wrong order.
                  <br />
                  Time Complexity: O(n²)
                </p>
              )}
              {sortingAlgorithm === "selection" && (
                <p>
                  <strong>Selection Sort:</strong> Divides the input into a sorted and an unsorted region, and
                  repeatedly selects the smallest element from the unsorted region.
                  <br />
                  Time Complexity: O(n²)
                </p>
              )}
              {sortingAlgorithm === "insertion" && (
                <p>
                  <strong>Insertion Sort:</strong> Builds the sorted array one item at a time by comparing each with the
                  items before it.
                  <br />
                  Time Complexity: O(n²)
                </p>
              )}
              {sortingAlgorithm === "merge" && (
                <p>
                  <strong>Merge Sort:</strong> Divides the array into halves, sorts them, and then merges them back
                  together.
                  <br />
                  Time Complexity: O(n log n)
                </p>
              )}
              {sortingAlgorithm === "quick" && (
                <p>
                  <strong>Quick Sort:</strong> Selects a 'pivot' element and partitions the array around the pivot.
                  <br />
                  Time Complexity: O(n log n) average, O(n²) worst case
                </p>
              )}
              {sortingAlgorithm === "heap" && (
                <p>
                  <strong>Heap Sort:</strong> Builds a heap from the array and repeatedly extracts the maximum element.
                  <br />
                  Time Complexity: O(n log n)
                </p>
              )}
              {sortingAlgorithm === "counting" && (
                <p>
                  <strong>Counting Sort:</strong> Counts the occurrences of each element and reconstructs the array in
                  order.
                  <br />
                  Time Complexity: O(n + k) where k is the range of input
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-background">
        <div className="flex items-end justify-center h-64 gap-1 relative">
          {array.map((value, index) => {
            const isSwapping = swappingIndices.includes(index)
            const isComparing = comparingIndices.includes(index)

            return (
              <div
                key={index}
                className={`w-full relative ${
                  isComparing ? "bg-yellow-500" : isSwapping ? "bg-green-500" : "bg-primary"
                }`}
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  maxWidth: `${Math.max(100 / array.length, 2)}%`,
                  minWidth: "2px",
                  transform: isSwapping
                    ? `translateY(-15px) scale(1.1)`
                    : isComparing
                      ? `translateY(-5px) scale(1.05)`
                      : "translateY(0) scale(1)",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                {isSwapping && (
                  <div className="absolute inset-0 animate-pulse bg-green-300 opacity-50 rounded-sm"></div>
                )}
                {array.length <= 20 && (
                  <span className="absolute bottom-0 left-0 right-0 text-center text-xs text-white font-bold">
                    {value}
                  </span>
                )}
              </div>
            )
          })}

          {/* Render arrows between compared elements */}
          {comparingIndices.length === 2 && (
            <ComparisonArrow
              fromIndex={comparingIndices[0]}
              toIndex={comparingIndices[1]}
              arrayLength={array.length}
              maxValue={maxValue}
              array={array}
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-primary mr-2"></div>
          <span>Unsorted</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-500 mr-2"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 mr-2"></div>
          <span>Swapping</span>
        </div>
        <div className="flex items-center">
          <div className="text-yellow-500 mr-2">→</div>
          <span>Comparison Direction</span>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        {isSorting ? "Sorting in progress..." : isSorted ? "Array sorted!" : "Ready to sort"}
      </div>
    </div>
  )
}
