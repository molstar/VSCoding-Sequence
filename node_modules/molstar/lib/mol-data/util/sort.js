/**
 * Copyright (c) 2017 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author David Sehnal <david.sehnal@gmail.com>
 */
export function arrayLess(arr, i, j) {
    return arr[i] - arr[j];
}
export function arraySwap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}
function medianPivotIndex(data, cmp, l, r) {
    const m = (l + r) >> 1;
    if (cmp(data, l, r) > 0)
        return cmp(data, l, m) > 0 ? cmp(data, m, r) > 0 ? m : r : l;
    else
        return cmp(data, r, m) > 0 ? cmp(data, m, l) > 0 ? m : l : r;
}
function partition(ctx, l, r) {
    const { cmp, swap, data, parts } = ctx;
    let equals = l + 1, tail = r;
    // move the median to the 1st spot
    swap(data, l, medianPivotIndex(data, cmp, l, r));
    while (cmp(data, tail, l) > 0) {
        --tail;
    }
    for (let i = l + 1; i <= tail; i++) {
        const c = cmp(data, i, l);
        if (c > 0) {
            swap(data, i, tail);
            --tail;
            while (cmp(data, tail, l) > 0) {
                --tail;
            }
            i--;
        }
        else if (c === 0) {
            swap(data, i, equals);
            equals++;
        }
    }
    // move the medians to the correct spots
    for (let i = l; i < equals; i++) {
        swap(data, i, l + tail - i);
    }
    parts[0] = tail - equals + l + 1;
    parts[1] = tail;
}
function insertionSort({ data, cmp, swap }, start, end) {
    for (let i = start + 1; i <= end; i++) {
        let j = i - 1;
        while (j >= start && cmp(data, j, j + 1) > 0) {
            swap(data, j, j + 1);
            j = j - 1;
        }
    }
}
function quickSort(ctx, low, high) {
    const { parts } = ctx;
    while (low < high) {
        if (high - low < 16) {
            insertionSort(ctx, low, high);
            return;
        }
        partition(ctx, low, high);
        const li = parts[0], ri = parts[1];
        if (li - low < high - ri) {
            quickSort(ctx, low, li - 1);
            low = ri + 1;
        }
        else {
            quickSort(ctx, ri + 1, high);
            high = li - 1;
        }
    }
}
function partitionArrayAsc(data, parts, l, r) {
    let equals = l + 1, tail = r;
    // move the median to the 1st spot
    arraySwap(data, l, medianPivotIndex(data, arrayLess, l, r));
    const pivot = data[l];
    while (data[tail] > pivot) {
        --tail;
    }
    for (let i = l + 1; i <= tail; i++) {
        const v = data[i];
        if (v > pivot) {
            arraySwap(data, i, tail);
            --tail;
            while (data[tail] > pivot) {
                --tail;
            }
            i--;
        }
        else if (v === pivot) {
            arraySwap(data, i, equals);
            ++equals;
        }
    }
    // move all medians to the correct spots
    for (let i = l; i < equals; i++) {
        arraySwap(data, i, l + tail - i);
    }
    parts[0] = tail - equals + l + 1;
    parts[1] = tail;
}
function insertionSortArrayAsc(data, start, end) {
    for (let i = start + 1; i <= end; i++) {
        const key = data[i];
        let j = i - 1;
        while (j >= start && data[j] > key) {
            data[j + 1] = data[j];
            j = j - 1;
        }
        data[j + 1] = key;
    }
}
function quickSortArrayAsc(data, parts, low, high) {
    while (low < high) {
        if (high - low < 16) {
            insertionSortArrayAsc(data, low, high);
            return;
        }
        partitionArrayAsc(data, parts, low, high);
        const li = parts[0], ri = parts[1];
        if (li - low < high - ri) {
            quickSortArrayAsc(data, parts, low, li - 1);
            low = ri + 1;
        }
        else {
            quickSortArrayAsc(data, parts, ri + 1, high);
            high = li - 1;
        }
    }
}
export function sortArray(data, cmp = arrayLess) {
    return sortArrayRange(data, 0, data.length, cmp);
}
export function sortArrayRange(data, start, end, cmp = arrayLess) {
    if (cmp === arrayLess)
        quickSortArrayAsc(data, [0, 0], start, end - 1);
    else
        quickSort({ data, cmp, swap: arraySwap, parts: [0, 0] }, start, end - 1);
    return data;
}
export function sort(data, start, end, cmp, swap) {
    const ctx = { data, cmp, swap, parts: [0, 0] };
    quickSort(ctx, start, end - 1);
    return data;
}
