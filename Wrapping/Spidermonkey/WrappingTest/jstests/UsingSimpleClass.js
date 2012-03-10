var someNew = new SimpleClass(); 
var uSC = new UsingSimpleClass(); 
var sc = uSC.returnCopy(); print(sc.intProp); sc.void_param0(); 
print(sc instanceof SimpleClass); 
uSC.passCopy(sc); 
uSC.passRef(sc); 
uSC.passPtr(sc);

print("Testing .prop");
print(uSC.prop.intProp);
uSC.prop = someNew;
print(uSC.prop.intProp);

print("Testing .ptrProp");
print(uSC.ptrProp.intProp);
uSC.ptrProp = someNew;
print(uSC.ptrProp.intProp);