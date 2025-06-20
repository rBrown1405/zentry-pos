// Simple test script for memorable account generation
const fs = require('fs');

// Read the ID utils file
const idUtilsContent = fs.readFileSync('id-utils.js', 'utf8');

// Extract the classes (simplified)
eval(idUtilsContent.replace(/window\.[^=]*=.*;/g, '').replace(/if \(typeof module.*$/s, ''));

console.log('🎯 Testing Memorable Account Generation');
console.log('=====================================');

const testCases = [
  { business: 'Wine Inc', property: 'John Wine Inc', staff: 'Alice Manager' },
  { business: 'Pizza Palace', property: 'Downtown Location', staff: 'Bob Server' },
  { business: 'Coffee Corner', property: 'Main Street Cafe', staff: 'Carol Barista' }
];

testCases.forEach((test, i) => {
  const account = IDGenerator.generateMemorableAccountName(test.business, test.property, test.staff);
  const isValid = IDGenerator.validateStaffID(account);
  console.log(`Test ${i+1}: ${test.business} + ${test.property} → ${account} (Valid: ${isValid})`);
});

console.log('\n✅ Testing completed!');
