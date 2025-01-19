import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function RecipeDetail() {
  const params = useLocalSearchParams();
  // Debug the received params
  console.log('Received params:', params);
  // Safely parse the recipe data
  let recipe;
  try {
    recipe = params.recipe ? JSON.parse(params.recipe as string) : null;
  } catch (error) {
    console.error('Error parsing recipe:', error);
    Alert.alert('Error', 'Failed to load recipe details.');
    recipe = null;
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid recipe data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.portion}>Portion: {recipe.originalPortion}</Text>

      {recipe.ingredients && (
        <View>
          <Text style={styles.sectionTitle}>Ingredients:</Text>
          {recipe.ingredients.map((ingredient: any, index: number) => (
            <Text key={index} style={styles.text}>
              - {ingredient.name}: {ingredient.weight} {ingredient.unit}
            </Text>
          ))}
        </View>
      )}

      {recipe.steps && (
        <View>
          <Text style={styles.sectionTitle}>Steps:</Text>
          {recipe.steps.map((step: string, index: number) => (
            <Text key={index} style={styles.text}>
              {index + 1}. {step}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  portion: {
    fontSize: 16,
    color: '#b0b0b0',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    color: '#b0b0b0',
  },
  errorText: {
    fontSize: 18,
    color: '#ff6f61',
    textAlign: 'center',
    marginTop: 20,
  },
});
