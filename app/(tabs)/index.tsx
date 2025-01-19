import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import fuzzysort from 'fuzzysort';
import { Recipe } from '../../types/recipe';

export default function RecipePreview() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [sortedRecipes, setSortedRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://192.168.1.185:5000/api/recipes');
        const data: Recipe[] = await response.json();
        setRecipes(data);
        setSortedRecipes(data); // Initialize filtered recipes
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  // Update filtered recipes when the search query changes
  useEffect(() => {
    if (!searchQuery) {
      setSortedRecipes(recipes); // Show all recipes when search is empty
      return;
    }

    // Sort recipes by relevance to the search query
    const results = fuzzysort.go(searchQuery, recipes, { key: 'name' });
    setSortedRecipes(results.map((result) => result.obj));
  }, [searchQuery, recipes]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Recipe Preview</Text>
      
      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by recipe name..."
        placeholderTextColor="#aaaaaa"
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
      />

      {/* Recipe Cards */}
      {sortedRecipes.map((recipe, index) => (
        <View key={index} style={styles.recipeCard}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.portion}>Portion: {recipe.originalPortion}</Text>

          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ingredients:</Text>
              {recipe.ingredients.map((ingredient, i) => (
                <Text key={i} style={styles.text}>
                  - {ingredient.name}: {ingredient.weight} {ingredient.unit}
                </Text>
              ))}
            </View>
          )}

          {recipe.steps && recipe.steps.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Steps:</Text>
              {recipe.steps.map((step, i) => (
                <Text key={i} style={styles.text}>
                  {i + 1}. {step}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {/* No Results Message */}
      {sortedRecipes.length === 0 && (
        <Text style={styles.noResults}>No recipes found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#ffffff',
    textAlign: 'center',
  },
  searchInput: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  recipeCard: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffcc00',
  },
  portion: {
    fontSize: 16,
    marginBottom: 10,
    color: '#cccccc',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ffffff',
  },
  text: {
    fontSize: 14,
    color: '#dddddd',
    lineHeight: 22,
  },
  noResults: {
    fontSize: 16,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 20,
  },
});
