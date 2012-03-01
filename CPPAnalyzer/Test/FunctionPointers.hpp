
typedef void (*FuncPointerName)(int, float);

void callFP(FuncPointerName* func);
void callFP(int (*param)(bool, float, int));