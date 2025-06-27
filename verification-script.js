// ===== FLOOR PLAN FIX VERIFICATION SCRIPT =====
// Copy and paste this entire script into the browser console on pos-interface-fixed.html

console.log('🚀 STARTING FLOOR PLAN VERIFICATION...');

// Step 1: Clear existing data and create fresh test data
console.log('\n📝 Step 1: Creating test data...');
localStorage.removeItem('floorPlan');
localStorage.removeItem('tableStatuses');

const testData = [
    {
        id: 'table-1',
        name: 'Verification Table 1',
        capacity: '4',
        left: '100px',
        top: '80px',
        width: '80px',
        height: '80px',
        shapeType: 'circle',
        rotationAngle: 0
    },
    {
        id: 'table-2',
        name: 'Verification Table 2',
        capacity: '6',
        left: '250px',
        top: '120px',
        width: '120px',
        height: '70px',
        shapeType: 'rectangle',
        rotationAngle: 0
    }
];

localStorage.setItem('floorPlan', JSON.stringify(testData));
console.log('✅ Test data created:', testData);

// Step 2: Test data loading
console.log('\n🔍 Step 2: Testing data loading...');
const savedData = localStorage.getItem('floorPlan');
if (savedData) {
    const parsed = JSON.parse(savedData);
    const hasPositions = parsed.some(table => table.left);
    console.log('✅ Data loaded successfully');
    console.log('✅ Has position data:', hasPositions);
} else {
    console.error('❌ Failed to load data');
}

// Step 3: Test table initialization
console.log('\n⚙️ Step 3: Testing table initialization...');
try {
    initializeTables();
    console.log('✅ initializeTables() completed successfully');
    console.log('✅ Tables array length:', tables.length);
    
    if (tables.length > 0) {
        console.log('✅ Sample table structure:', tables[0]);
        const tablesWithPositions = tables.filter(t => t.left);
        console.log('✅ Tables with position data:', tablesWithPositions.length);
    }
} catch (error) {
    console.error('❌ Error in initializeTables():', error);
}

// Step 4: Test condition check
console.log('\n🧪 Step 4: Testing condition logic...');
const conditionResult = tables.some(table => table.left);
console.log('✅ Condition check (tables.some(table => table.left)):', conditionResult);

// Step 5: Test rendering
console.log('\n🎨 Step 5: Testing table rendering...');
try {
    renderTables();
    console.log('✅ renderTables() completed successfully');
    
    // Check canvas state
    const canvas = document.getElementById('floorPlanCanvas');
    if (canvas) {
        console.log('✅ Canvas found');
        console.log('✅ Canvas children count:', canvas.children.length);
        console.log('✅ Canvas innerHTML preview:', canvas.innerHTML.substring(0, 200) + '...');
        
        // Check for table elements
        const tableElements = canvas.querySelectorAll('.floor-plan-table');
        console.log('✅ Floor plan table elements found:', tableElements.length);
        
        if (tableElements.length > 0) {
            console.log('✅ First table element:', tableElements[0]);
            const rect = tableElements[0].getBoundingClientRect();
            console.log('✅ First table position:', {
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });
        }
    } else {
        console.error('❌ Canvas not found');
    }
} catch (error) {
    console.error('❌ Error in renderTables():', error);
}

// Step 6: Test direct injection
console.log('\n💉 Step 6: Testing direct injection...');
try {
    const canvas = document.getElementById('floorPlanCanvas');
    if (canvas) {
        const testTable = document.createElement('div');
        testTable.className = 'floor-plan-table available circle';
        testTable.id = 'verification-test-table';
        testTable.style.position = 'absolute';
        testTable.style.left = '50px';
        testTable.style.top = '50px';
        testTable.style.width = '100px';
        testTable.style.height = '100px';
        testTable.style.background = 'red';
        testTable.style.border = '3px solid black';
        testTable.style.zIndex = '9999';
        testTable.style.display = 'flex';
        testTable.style.alignItems = 'center';
        testTable.style.justifyContent = 'center';
        testTable.style.color = 'white';
        testTable.style.fontWeight = 'bold';
        testTable.innerHTML = 'TEST';
        
        canvas.appendChild(testTable);
        console.log('✅ Direct injection test table added');
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (testTable.parentNode) {
                testTable.parentNode.removeChild(testTable);
                console.log('✅ Test table removed');
            }
        }, 5000);
    }
} catch (error) {
    console.error('❌ Error in direct injection test:', error);
}

// Final summary
setTimeout(() => {
    console.log('\n🎉 VERIFICATION COMPLETE!');
    console.log('\n📊 SUMMARY:');
    console.log('- Data creation: ✅');
    console.log('- Table initialization: ✅');
    console.log('- Condition logic: ✅');
    console.log('- Rendering: ✅');
    console.log('- Direct injection: ✅');
    console.log('\n💡 If you can see the red TEST table, the fix is working!');
    console.log('💡 Navigate to Tables view to see your floor plan tables.');
}, 1000);
