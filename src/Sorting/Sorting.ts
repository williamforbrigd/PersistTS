import { Comparator} from '../Interfaces/Comparator';

/**
 * Utility class that provides algorithms for sorting.
 * It contains the Timsort algorithm, along with helper methods for insertion sort and merge sort. 
 * 
 * Timsort is a hybrid sorting algorithm derived from merge sort and insertion sort.
 * It is the default sorting algorithm in Python and Java for arrays/lists due to its efficiency and stability.
 */
export default class Sorting {
    constructor() {}

    /**
     * Sort the given array in-place using Timsort algorithm.
     * Timsort breaks the array into small sorted runs, and then merges them.
     * 
     * @param arr - The array to be sorted.
     * @param compare - A comparator function to define the order of the elements.
     */
    public static timSort<T>(arr: T[], compare: Comparator<T>): void {
        const n = arr.length;
        const run = 32;
        let i=0;
        let left =0;
        
        while (i < n) {
            const tmp = Math.min(i + run - 1, n - 1);
            Sorting.insertionSort(arr, i, tmp, compare);
            i += run;
        }
        
        let size = run;
        while (size < n) {
            while (left < n) {
                let mid = left + size - 1;
                let right = Math.min(left + 2 * size - 1, n - 1);
                if (mid < right) {
                    Sorting.merge(arr, left, mid, right, compare);
                }
                left += 2 * size;
            }
            left = 0;
            size *= 2;
        }
    }

    /**
     * Performs insertion sort on a subrange of the array.
     * This is used as the base case in Timsort when sorting small runs.
     * 
     * @param arr - The array to be sorted.
     * @param left - The starting index of the subrange.
     * @param right - The ending index of the subrange.
     * @param compare - A comparator function to define the order of the elements.
     */
    private static insertionSort<T>(arr: T[], left: number, right: number, compare: Comparator<T>): void {
        for (let i=left+1; i <= right; i++) {
            const tmp = arr[i];
            let j = i-1;
            // while (j >= left && arr[j] > tmp) {
            while (j >= left && compare(arr[j], tmp) > 0) {
                arr[j+1] = arr[j];
                j--;
            }
            arr[j+1] = tmp;
        }
    }

    /**
     * Merges two adjacent sorted subarrays in the array.
     * Used interally during the Timsort merge phase.
     * 
     * @param arr - The array containing the subranges to merge.
     * @param l - The starting index of the first array.
     * @param m - The ending index of the first subarray and one before the second.
     * @param r - The ending index of the second subarray.
     * @param compare - A comparator function to define the order of the elements.
     */
    private static merge<T>(arr: T[], l: number, m: number, r: number, compare: Comparator<T>): void {
        // let x,y,i,j,k = 0;
        // y=0;
        let len1 = m - l + 1;
        let len2 = r - m;
        const left = new Array(len1);
        const right = new Array(len2);

        for (let x=0; x < len1; x++) {
            left[x] = arr[l + x];
        }
        for (let y=0; y < len2; y++) {
            right[y] = arr[m + 1 + y];
        }

        let i=0, j=0, k=l;
        // Merge the left and the right arrays
        while (i < len1 && j < len2) {
            // if (left[i] <= right[j]) {
            if (compare(left[i], right[j]) <= 0) {
                arr[k] = left[i];
                i++;
            } else {
                arr[k] = right[j];
                j++;
            }
            k++;
        }

        // Copy the remaining elements of left, if any.
        while (i < len1) {
            arr[k] = left[i];
            k++;
            i++;
        }

        // Copy the remaining elements of right, if any.
        while (j < len2) {
            arr[k] = right[j];
            k++;
            j++;
        }
    }

    /**
     * Checks if the array is sorted according to the provided comparator.
     * 
     * @param arr - The array to check.
     * @param compare - A comparator function to determine the order of the elements.
     * @returns true if the array is sorted, false otherwise.
     */
    public static isSorted<T>(arr: T[], compare: Comparator<T>): boolean {
        for (let i = 1; i < arr.length; i++) {
            if (compare(arr[i - 1], arr[i]) > 0) {
                return false;
            }
        }
        return true;
    }

    
}