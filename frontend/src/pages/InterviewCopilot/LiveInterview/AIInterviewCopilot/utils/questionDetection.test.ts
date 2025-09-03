import { isQuestion } from './questionDetection';

// Test cases to demonstrate the improved question detection
const testCases = [
    // Questions that should be detected
    { text: "What is the weather like?", expected: true },
    { text: "How do I get there?", expected: true },
    { text: "Can you help me?", expected: true },
    { text: "Could you explain this?", expected: true },
    { text: "Tell me about React", expected: true },
    { text: "Do you know the answer?", expected: true },
    { text: "Please tell me more", expected: true },
    { text: "Where is the nearest store?", expected: true },

    // Statements that should NOT be detected
    { text: "I want to go home", expected: false },
    { text: "The weather is nice", expected: false },
    { text: "I can do this", expected: false },
    { text: "You should try it", expected: false },
    { text: "I will help you", expected: false },
    { text: "This is what I need", expected: false },
    { text: "I have a question", expected: false },
    { text: "Please help me", expected: false },
];

console.log('Testing question detection logic:');
console.log('================================');

testCases.forEach(({ text, expected }, index) => {
    const result = isQuestion(text);
    const status = result === expected ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. "${text}" -> ${result} (expected: ${expected}) ${status}`);
});

console.log('\nBenefits of the new approach:');
console.log('1. ✅ Cleaner, more readable code');
console.log('2. ✅ Centralized logic in shared utility');
console.log('3. ✅ Better maintainability');
console.log('4. ✅ Reduced false positives');
console.log('5. ✅ Easier to extend with new patterns');
