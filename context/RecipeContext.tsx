import React, { createContext, useContext, useEffect, useState } from 'react';

export type Recipe = {
  _id: string;
  name: string;
  originalPortion: number;
  ingredients: Array<{ name: string; weight: number; unit: string }>;
  steps: string[];
};

type RecipeContextType = {
  recipes: Recipe[];
  fetchRecipes: () => Promise<void>;
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
};

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('https://6000-2a0a-ef40-254-8701-4c28-d852-59c8-f8b1.ngrok-free.app/api/recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  return (
    <RecipeContext.Provider value={{ recipes, fetchRecipes, setRecipes }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipeContext = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipeContext must be used within a RecipeProvider');
  }
  return context;
};
