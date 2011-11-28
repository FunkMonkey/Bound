// caching #1
#include <vector>

class GameObject
{

};

class TestClass
{
	protected:
	std::vector<GameObject*> gameObjects;
	
	public:
	void addGameObject(GameObject* gameObj)
	{
		gameObjects.push(gameObj);
	}
	
	GameObject* getGameObjectAt(int i)
	{
		if(i >= gameObjects.size())
			return null;
		
		return gameObjects[i];
	}
};

GameObject* getGameObjectFromTestClass(TestClass& testClass, int i)
{
	return testClass.getGameObjectAt(i);
}