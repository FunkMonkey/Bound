struct Struct
{
  int anInt;
  float aFloat;
  std::string aString;
}

class Class1
{

public:  

  // return
  Class1 returnCopy();
  Class1* returnPointer();
  Class1& returnReference();
  const Class1& returnConstReference();
  const Class1* returnConstPointer();
  // TODO: const pointers
  
  // params
  void param0();
  void param1Int(int x);
  void param2Int(int x, int y);
  void param1ObjCopy(Class1 copy);
  void param1ObjReference(Class1& ref);
  void param1ObjConstReference(const Class1& ref);
  void param1ObjPointer(Class1* pointer);
  void param1VoidPointer(void* pointer);
  void param1ObjOutPointer(Class1** pointer);
  // TODO: const pointers
  
  // TODO: signs
  
  virtual void virtualFunc(int x);
  void nonVirtualFunc(int x);
  
  // polymorph functions
  int polymorphReturn();
  Class1* polymorphReturn();
  void polymorphParam(Class1* pointer);
  void polymorphParam(int x);
  void multiParam(int x);
  void multiParam(int x, Class1* pointer);
  void multiParam(Class1* pointer);
  void multiParam(Class1* pointer, int x); 
  
  // optional params
  void optionalParam(int x, int y = 3);
  
  // const functions
  void constFunc() const;
  
  // static functions
  static staticFunc();
  
  // getters and setters
  void setInt(int x);
  int getInt();
  
  // strings
  std::string returnString();
  const std::string& returnStringConstReference();
  std::string& returnStringReference();
  std::string* returnStringPointer();
  void paramString(std::string str);
  void paramStringReference(std::string& str);
  void paramStringConstReference(const std::string& str);
  
  char* 

};

class Class2 : public Class1
{
  virtual void virtualFunc(int x);
  void nonVirtualFunc(int x);
};

class PrivateConstructor
{
private: 
	PrivateConstructor();
}