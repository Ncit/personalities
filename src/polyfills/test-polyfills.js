/**
 * Test file to verify polyfills are working correctly
 * This can be used to debug Android WebView compatibility issues
 */

function testPolyfills() {
    console.log('Testing polyfills...');
    
    const tests = {
        promise: typeof Promise !== 'undefined',
        async: typeof (async () => {}) === 'function',
        await: (() => {
            try {
                // Test async/await without eval
                const testAsync = async () => { await Promise.resolve(); };
                return typeof testAsync === 'function';
            } catch (e) {
                return false;
            }
        })(),
        arrayFind: typeof Array.prototype.find === 'function',
        arrayIncludes: typeof Array.prototype.includes === 'function',
        stringIncludes: typeof String.prototype.includes === 'function',
        stringStartsWith: typeof String.prototype.startsWith === 'function',
        stringEndsWith: typeof String.prototype.endsWith === 'function',
        objectAssign: typeof Object.assign === 'function',
        fetch: typeof fetch === 'function',
        console: typeof console !== 'undefined',
        localStorage: typeof localStorage !== 'undefined'
    };
    
    console.log('Polyfill test results:', tests);
    
    const allPassed = Object.values(tests).every(test => test);
    
    if (allPassed) {
        console.log('✅ All polyfills are working correctly!');
    } else {
        console.log('❌ Some polyfills failed:');
        Object.entries(tests).forEach(([name, passed]) => {
            if (!passed) {
                console.log(`  - ${name}: FAILED`);
            }
        });
    }
    
    return tests;
}

// Test async/await specifically
async function testAsyncAwait() {
    try {
        console.log('Testing async/await...');
        const result = await Promise.resolve('async/await works!');
        console.log('✅ Async/await test passed:', result);
        return true;
    } catch (error) {
        console.error('❌ Async/await test failed:', error);
        return false;
    }
}

// Auto-run tests when loaded
if (typeof window !== 'undefined') {
    window.testPolyfills = testPolyfills;
    window.testAsyncAwait = testAsyncAwait;
    
    // Run tests after a short delay to ensure everything is loaded
    setTimeout(() => {
        testPolyfills();
        testAsyncAwait();
    }, 100);
}

export { testPolyfills, testAsyncAwait }; 