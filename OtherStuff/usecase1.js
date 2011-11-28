
// --- 1.
var tc = getNewTestClass();
tc.comp1.x = 7;
tc.comp2.x = 7;
tc.comp3.x = 7;

// --- 2. TestClass: js-o, TestComponent: js-o
// cpp-Code is wrong as it deletes TestComponent-instances
var tc = getNewTestClass();
var comp1 = tc.comp1; // lazy prop comp1 created

tc = null; // gc will delete tc and TestClass will delete all components
comp1.x; // crash!

// --- 2. TestClass: js-o, TestComponent: js-o
// cpp-Code is wrong as it deletes TestComponent-instances
var tc = getNewTestClass();
var comp1 = tc.comp1; // lazy prop comp1 created

comp1 = null; // gc will delete comp1
tc.comp1.x; // crash!

// --- 3. TestClass: cpp-o, TestComponent: js-o
// cpp-Code is wrong as it deletes TestComponent-instances
var tc = getNewTestClass();
var comp1 = tc.comp1; // lazy prop comp1 created

deleteTestClass(tc); // TestClass will delete all components
comp1.x; // crash!

// --- 4. TestClass: js-o, TestComponent: cpp-o
// cpp-Code is wrong as it deletes TestComponent-instances
var tc = getNewTestClass();
var comp1 = tc.comp1; // lazy prop comp1 created

tc = null; // gc will delete tc and TestClass will delete all components
comp1.x; // crash!
