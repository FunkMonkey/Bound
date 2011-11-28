// const returns

struct Vector2
{

	int x;
	int y;
	
	Vector2() : x(0), y(0)
	{
	}
};

class ConstTestClass
{
	Vector2 vec2;
	Vector2 vec2b;
	Vector2* vecP;
	
	public:
	const Vector2& getVec2() const { return vec2; } // return copy? const wrap? non-const wrap?
	
	const Vector2& getVec2b() const { return vec2b; }
	void setVec2b(const Vector2& vec){ vec2b.x = vec.x; vec2b.y = vec.y;}
	
	const Vector2& getVecP() const { return *vecP;}
	void setVecP(Vector2* vec){ vecP = vec;}
};