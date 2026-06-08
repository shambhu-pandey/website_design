// ============================================================
// data.js — TCS NQT Question Bank
// All questions organized by topic with metadata
// ============================================================

const TOPICS = [
  "Arrays", "Strings", "Numbers", "Number System",
  "Sorting", "Linked List", "Stack", "Queue",
  "Trees", "DP", "Greedy", "Revision"
];

const QUESTIONS = [
  // ── ARRAYS ──────────────────────────────────────────────
  { id: 1, topic: "Arrays", title: "Find the Smallest Number in an Array", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-find-minimum-maximum-element-array/", starred: false },
  { id: 2, topic: "Arrays", title: "Find the Largest Number in an Array", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-find-minimum-maximum-element-array/", starred: false },
  { id: 3, topic: "Arrays", title: "Second Smallest and Second Largest Element", difficulty: "Easy", link: "https://www.geeksforgeeks.org/to-find-smallest-and-second-smallest-element-in-an-array/", starred: false },
  { id: 4, topic: "Arrays", title: "Reverse a Given Array", difficulty: "Easy", link: "https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/", starred: false },
  { id: 5, topic: "Arrays", title: "Count Frequency of Each Element", difficulty: "Easy", link: "https://www.geeksforgeeks.org/counting-frequencies-of-array-elements/", starred: false },
  { id: 6, topic: "Arrays", title: "Rearrange Array in Increasing-Decreasing Order", difficulty: "Medium", link: "https://www.geeksforgeeks.org/rearrange-array-maximum-minimum-form/", starred: false },
  { id: 7, topic: "Arrays", title: "Calculate Sum of Elements", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-find-sum-elements-given-array/", starred: false },
  { id: 8, topic: "Arrays", title: "Rotate Array by K Elements (Block Swap)", difficulty: "Medium", link: "https://www.geeksforgeeks.org/block-swap-algorithm-for-array-rotation/", starred: true },
  { id: 9, topic: "Arrays", title: "Average of All Elements", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-average-array-whole-numbers/", starred: false },
  { id: 10, topic: "Arrays", title: "Find the Median of the Array", difficulty: "Medium", link: "https://www.geeksforgeeks.org/median-of-an-array/", starred: false },
  { id: 11, topic: "Arrays", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", link: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/", starred: false },
  { id: 12, topic: "Arrays", title: "Remove Duplicates from Unsorted Array", difficulty: "Medium", link: "https://www.geeksforgeeks.org/remove-duplicates-from-unsorted-array/", starred: false },
  { id: 13, topic: "Arrays", title: "Find All Repeating Elements", difficulty: "Medium", link: "https://www.geeksforgeeks.org/find-duplicates-in-o-n-time-and-o-1-extra-space/", starred: true },
  { id: 14, topic: "Arrays", title: "Find All Non-Repeating Elements", difficulty: "Medium", link: "https://www.geeksforgeeks.org/find-the-two-non-repeating-elements-in-an-array-of-repeating-elements/", starred: false },
  { id: 15, topic: "Arrays", title: "Find All Symmetric Pairs", difficulty: "Medium", link: "https://www.geeksforgeeks.org/find-all-symmetric-pairs-in-an-array/", starred: false },
  { id: 16, topic: "Arrays", title: "Maximum Product Subarray", difficulty: "Hard", link: "https://leetcode.com/problems/maximum-product-subarray/", starred: true },
  { id: 17, topic: "Arrays", title: "Replace Each Element by Its Rank", difficulty: "Medium", link: "https://www.geeksforgeeks.org/replace-each-element-of-the-array-by-its-corresponding-rank/", starred: false },
  { id: 18, topic: "Arrays", title: "Sort Array Elements by Frequency", difficulty: "Medium", link: "https://www.geeksforgeeks.org/sort-elements-by-frequency/", starred: false },
  { id: 19, topic: "Arrays", title: "Finding Equilibrium Index", difficulty: "Medium", link: "https://www.geeksforgeeks.org/equilibrium-index-of-an-array/", starred: true },
  { id: 20, topic: "Arrays", title: "Check if Array is Subset of Another", difficulty: "Medium", link: "https://www.geeksforgeeks.org/find-whether-an-array-is-subset-of-another-array/", starred: false },

  // ── NUMBERS ──────────────────────────────────────────────
  { id: 21, topic: "Numbers", title: "Check if a Number is Palindrome", difficulty: "Easy", link: "https://www.geeksforgeeks.org/check-if-a-number-is-palindrome/", starred: false },
  { id: 22, topic: "Numbers", title: "Find All Palindrome Numbers in Range", difficulty: "Easy", link: "https://www.geeksforgeeks.org/count-palindrome-numbers-in-a-range/", starred: false },
  { id: 23, topic: "Numbers", title: "Check if a Number is Prime", difficulty: "Easy", link: "https://www.geeksforgeeks.org/prime-numbers/", starred: true },
  { id: 24, topic: "Numbers", title: "Prime Numbers in a Given Range", difficulty: "Easy", link: "https://www.geeksforgeeks.org/sieve-of-eratosthenes/", starred: false },
  { id: 25, topic: "Numbers", title: "Check Armstrong Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-to-check-armstrong-number/", starred: false },
  { id: 26, topic: "Numbers", title: "Check Perfect Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/perfect-number/", starred: false },
  { id: 27, topic: "Numbers", title: "Sum of First N Natural Numbers", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-find-sum-first-n-natural-numbers/", starred: false },
  { id: 28, topic: "Numbers", title: "Print Fibonacci up to Nth Term", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-for-nth-fibonacci-number/", starred: true },
  { id: 29, topic: "Numbers", title: "Factorial of a Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-for-factorial-of-a-number/", starred: false },
  { id: 30, topic: "Numbers", title: "GCD of Two Numbers", difficulty: "Easy", link: "https://www.geeksforgeeks.org/c-program-find-gcd-hcf-two-numbers/", starred: true },
  { id: 31, topic: "Numbers", title: "LCM of Two Numbers", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-to-find-lcm-of-two-numbers/", starred: false },
  { id: 32, topic: "Numbers", title: "Reverse Digits of a Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/write-a-c-program-to-reverse-digits-of-a-number/", starred: false },
  { id: 33, topic: "Numbers", title: "Check Strong Number", difficulty: "Medium", link: "https://www.geeksforgeeks.org/strong-number/", starred: false },
  { id: 34, topic: "Numbers", title: "Check Automorphic Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/automorphic-number/", starred: false },
  { id: 35, topic: "Numbers", title: "Sum of Digits of a Number", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-for-sum-of-digits/", starred: false },
  { id: 36, topic: "Numbers", title: "Can Number be Sum of Two Primes", difficulty: "Medium", link: "https://www.geeksforgeeks.org/check-if-a-number-can-be-expressed-as-sum-of-two-prime-numbers/", starred: true },
  { id: 37, topic: "Numbers", title: "Find Roots of Quadratic Equation", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-to-find-roots-of-a-quadratic-equation/", starred: false },

  // ── NUMBER SYSTEM ──────────────────────────────────────
  { id: 38, topic: "Number System", title: "Binary to Decimal Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-binary-decimal-conversion/", starred: false },
  { id: 39, topic: "Number System", title: "Binary to Octal Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/convert-octal-number-binary-number/", starred: false },
  { id: 40, topic: "Number System", title: "Decimal to Binary Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-decimal-binary-conversion/", starred: true },
  { id: 41, topic: "Number System", title: "Decimal to Octal Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/decimal-octal-conversion/", starred: false },
  { id: 42, topic: "Number System", title: "Octal to Binary Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/convert-octal-number-binary-number/", starred: false },
  { id: 43, topic: "Number System", title: "Octal to Decimal Conversion", difficulty: "Easy", link: "https://www.geeksforgeeks.org/octal-to-decimal-conversion/", starred: false },
  { id: 44, topic: "Number System", title: "Convert Digits/Numbers to Words", difficulty: "Medium", link: "https://www.geeksforgeeks.org/convert-number-to-words/", starred: false },

  // ── SORTING ──────────────────────────────────────────────
  { id: 45, topic: "Sorting", title: "Bubble Sort Algorithm", difficulty: "Easy", link: "https://www.geeksforgeeks.org/bubble-sort/", starred: true },
  { id: 46, topic: "Sorting", title: "Selection Sort Algorithm", difficulty: "Easy", link: "https://www.geeksforgeeks.org/selection-sort/", starred: true },
  { id: 47, topic: "Sorting", title: "Insertion Sort Algorithm", difficulty: "Easy", link: "https://www.geeksforgeeks.org/insertion-sort/", starred: true },
  { id: 48, topic: "Sorting", title: "Quick Sort Algorithm", difficulty: "Medium", link: "https://www.geeksforgeeks.org/quick-sort/", starred: true },
  { id: 49, topic: "Sorting", title: "Merge Sort Algorithm", difficulty: "Medium", link: "https://www.geeksforgeeks.org/merge-sort/", starred: true },

  // ── STRINGS ──────────────────────────────────────────────
  { id: 50, topic: "Strings", title: "Check if String is Palindrome", difficulty: "Easy", link: "https://www.geeksforgeeks.org/c-program-check-given-string-palindrome/", starred: true },
  { id: 51, topic: "Strings", title: "Count Vowels, Consonants, Spaces", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-count-vowels-consonants-digits-special-characters-string/", starred: false },
  { id: 52, topic: "Strings", title: "Remove All Vowels from String", difficulty: "Easy", link: "https://www.geeksforgeeks.org/remove-vowels-from-string/", starred: false },
  { id: 53, topic: "Strings", title: "Reverse a String", difficulty: "Easy", link: "https://www.geeksforgeeks.org/reverse-a-string-in-c-cpp-different-methods/", starred: false },
  { id: 54, topic: "Strings", title: "Remove Brackets from Algebraic Expression", difficulty: "Medium", link: "https://www.geeksforgeeks.org/remove-brackets-algebraic-string-determine-sign-each-character/", starred: false },
  { id: 55, topic: "Strings", title: "Sum of Numbers in a String", difficulty: "Medium", link: "https://www.geeksforgeeks.org/sum-of-numbers-in-a-string/", starred: false },
  { id: 56, topic: "Strings", title: "Check if Two Strings are Anagram", difficulty: "Easy", link: "https://www.geeksforgeeks.org/check-whether-two-strings-are-anagram-of-each-other/", starred: true },
  { id: 57, topic: "Strings", title: "Return Maximum Occurring Character", difficulty: "Easy", link: "https://www.geeksforgeeks.org/return-maximum-occurring-character-in-the-input-string/", starred: false },
  { id: 58, topic: "Strings", title: "Remove All Duplicates from String", difficulty: "Medium", link: "https://www.geeksforgeeks.org/remove-all-duplicates-from-the-input-string/", starred: false },
  { id: 59, topic: "Strings", title: "Reverse Words in a String", difficulty: "Medium", link: "https://www.geeksforgeeks.org/reverse-words-in-a-given-string/", starred: true },
  { id: 60, topic: "Strings", title: "Find Largest Word in a String", difficulty: "Easy", link: "https://www.geeksforgeeks.org/find-the-largest-word-in-a-given-string/", starred: false },
  { id: 61, topic: "Strings", title: "Sort Characters in a String", difficulty: "Easy", link: "https://www.geeksforgeeks.org/sort-string-characters/", starred: false },
  { id: 62, topic: "Strings", title: "Count Number of Words in String", difficulty: "Easy", link: "https://www.geeksforgeeks.org/count-words-in-a-given-string/", starred: false },
  { id: 63, topic: "Strings", title: "Find Substring Position within String", difficulty: "Medium", link: "https://www.geeksforgeeks.org/java-program-to-find-the-occurrence-of-the-character-in-the-string/", starred: false },
  { id: 64, topic: "Strings", title: "Change Case of Each Character", difficulty: "Easy", link: "https://www.geeksforgeeks.org/toggle-case-of-a-string-using-bitwise-operators/", starred: false },

  // ── LINKED LIST ──────────────────────────────────────────
  { id: 65, topic: "Linked List", title: "Insert Node at Beginning", difficulty: "Easy", link: "https://www.geeksforgeeks.org/linked-list-set-2-inserting-a-node/", starred: false },
  { id: 66, topic: "Linked List", title: "Delete a Node", difficulty: "Easy", link: "https://www.geeksforgeeks.org/linked-list-set-3-deleting-node/", starred: false },
  { id: 67, topic: "Linked List", title: "Reverse a Linked List", difficulty: "Medium", link: "https://www.geeksforgeeks.org/reverse-a-linked-list/", starred: true },
  { id: 68, topic: "Linked List", title: "Detect Loop in Linked List", difficulty: "Medium", link: "https://www.geeksforgeeks.org/detect-loop-in-a-linked-list/", starred: true },
  { id: 69, topic: "Linked List", title: "Find Middle of Linked List", difficulty: "Easy", link: "https://www.geeksforgeeks.org/write-a-c-function-to-print-the-middle-of-the-linked-list/", starred: false },

  // ── STACK ────────────────────────────────────────────────
  { id: 70, topic: "Stack", title: "Implement Stack Using Array", difficulty: "Easy", link: "https://www.geeksforgeeks.org/stack-data-structure-introduction-program/", starred: false },
  { id: 71, topic: "Stack", title: "Balanced Parentheses Check", difficulty: "Medium", link: "https://www.geeksforgeeks.org/check-for-balanced-parentheses-in-an-expression/", starred: true },
  { id: 72, topic: "Stack", title: "Next Greater Element", difficulty: "Medium", link: "https://www.geeksforgeeks.org/next-greater-element/", starred: true },
  { id: 73, topic: "Stack", title: "Reverse a String Using Stack", difficulty: "Easy", link: "https://www.geeksforgeeks.org/stack-set-3-reverse-string-using-stack/", starred: false },

  // ── QUEUE ────────────────────────────────────────────────
  { id: 74, topic: "Queue", title: "Implement Queue Using Array", difficulty: "Easy", link: "https://www.geeksforgeeks.org/queue-set-1introduction-and-array-implementation/", starred: false },
  { id: 75, topic: "Queue", title: "Implement Queue Using Two Stacks", difficulty: "Medium", link: "https://www.geeksforgeeks.org/queue-using-stacks/", starred: true },
  { id: 76, topic: "Queue", title: "Circular Queue Implementation", difficulty: "Medium", link: "https://www.geeksforgeeks.org/circular-queue-set-1-introduction-array-implementation/", starred: false },

  // ── TREES ────────────────────────────────────────────────
  { id: 77, topic: "Trees", title: "Inorder Traversal of Binary Tree", difficulty: "Easy", link: "https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/", starred: false },
  { id: 78, topic: "Trees", title: "Height of Binary Tree", difficulty: "Easy", link: "https://www.geeksforgeeks.org/write-a-c-program-to-find-the-maximum-depth-or-height-of-a-tree/", starred: true },
  { id: 79, topic: "Trees", title: "Level Order Traversal (BFS)", difficulty: "Medium", link: "https://www.geeksforgeeks.org/level-order-tree-traversal/", starred: true },
  { id: 80, topic: "Trees", title: "Check if Binary Tree is BST", difficulty: "Medium", link: "https://www.geeksforgeeks.org/a-program-to-check-if-a-binary-tree-is-bst-or-not/", starred: false },

  // ── DP ───────────────────────────────────────────────────
  { id: 81, topic: "DP", title: "Fibonacci using DP (Memoization)", difficulty: "Easy", link: "https://www.geeksforgeeks.org/program-for-nth-fibonacci-number/", starred: true },
  { id: 82, topic: "DP", title: "0/1 Knapsack Problem", difficulty: "Hard", link: "https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/", starred: true },
  { id: 83, topic: "DP", title: "Longest Common Subsequence", difficulty: "Hard", link: "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/", starred: true },
  { id: 84, topic: "DP", title: "Coin Change Problem", difficulty: "Medium", link: "https://www.geeksforgeeks.org/coin-change-dp-7/", starred: true },
  { id: 85, topic: "DP", title: "Longest Increasing Subsequence", difficulty: "Hard", link: "https://www.geeksforgeeks.org/longest-increasing-subsequence-dp-3/", starred: false },

  // ── GREEDY ───────────────────────────────────────────────
  { id: 86, topic: "Greedy", title: "Activity Selection Problem", difficulty: "Medium", link: "https://www.geeksforgeeks.org/activity-selection-problem-greedy-algo-1/", starred: true },
  { id: 87, topic: "Greedy", title: "Fractional Knapsack", difficulty: "Medium", link: "https://www.geeksforgeeks.org/fractional-knapsack-problem/", starred: true },
  { id: 88, topic: "Greedy", title: "Job Sequencing Problem", difficulty: "Medium", link: "https://www.geeksforgeeks.org/job-sequencing-problem/", starred: false },
  { id: 89, topic: "Greedy", title: "Huffman Coding", difficulty: "Hard", link: "https://www.geeksforgeeks.org/huffman-coding-greedy-algo-3/", starred: false },

  // ── REVISION (Important / Frequently Asked) ──────────────
  { id: 90, topic: "Revision", title: "Two Sum Problem", difficulty: "Easy", link: "https://leetcode.com/problems/two-sum/", starred: true },
  { id: 91, topic: "Revision", title: "Kadane's Algorithm (Max Subarray)", difficulty: "Medium", link: "https://www.geeksforgeeks.org/largest-sum-contiguous-subarray/", starred: true },
  { id: 92, topic: "Revision", title: "Binary Search Algorithm", difficulty: "Easy", link: "https://www.geeksforgeeks.org/binary-search/", starred: true },
  { id: 93, topic: "Revision", title: "Merge Two Sorted Arrays", difficulty: "Easy", link: "https://www.geeksforgeeks.org/merge-two-sorted-arrays/", starred: true },
  { id: 94, topic: "Revision", title: "Dutch National Flag (Sort 0s 1s 2s)", difficulty: "Medium", link: "https://www.geeksforgeeks.org/sort-an-array-of-0s-1s-and-2s/", starred: true },
  { id: 95, topic: "Revision", title: "Trapping Rain Water", difficulty: "Hard", link: "https://leetcode.com/problems/trapping-rain-water/", starred: true },
  { id: 96, topic: "Revision", title: "Missing Number in Array", difficulty: "Easy", link: "https://leetcode.com/problems/missing-number/", starred: true },
  { id: 97, topic: "Revision", title: "Power Set of a String", difficulty: "Medium", link: "https://www.geeksforgeeks.org/power-set/", starred: false },
  { id: 98, topic: "Revision", title: "Spiral Matrix Traversal", difficulty: "Medium", link: "https://leetcode.com/problems/spiral-matrix/", starred: true },
  { id: 99, topic: "Revision", title: "Stock Buy & Sell for Max Profit", difficulty: "Easy", link: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", starred: true },
  { id: 100, topic: "Revision", title: "Rotate Matrix 90 Degrees", difficulty: "Medium", link: "https://leetcode.com/problems/rotate-image/", starred: false },
];
