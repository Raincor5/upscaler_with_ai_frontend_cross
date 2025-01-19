import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function RecipeScaler() {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [scalingMode, setScalingMode] = useState('portion');
  const [scaleFactor, setScaleFactor] = useState(1);
  const [availability, setAvailability] = useState({ ingredient: '', weight: 0 });
  const [scaledIngredients, setScaledIngredients] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('http://192.168.1.185:5000/api/recipes');
        const data = await response.json();
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
    };

    fetchRecipes();
  }, []);

  const scaleRecipe = async () => {
    if (!selectedRecipe) return alert('Please select a recipe.');

    const payload = {
      recipe: selectedRecipe,
      scalingMode,
      parameter:
        scalingMode === 'portion'
          ? { desiredPortion: scaleFactor }
          : { availableIngredientName: availability.ingredient, availableWeight: availability.weight },
    };

    try {
      const response = await fetch('http://<YOUR_IP>:5000/api/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Scaling failed.');
      const data = await response.json();
      setScaledIngredients(data.scaledIngredients);
    } catch (error) {
      console.error('Error scaling recipe:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scale Recipes</Text>
      <Picker
        selectedValue={selectedRecipe}
        onValueChange={(itemValue) => setSelectedRecipe(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a Recipe" value={null} />
        {recipes.map((recipe) => (
          <Picker.Item key={recipe._id} label={recipe.name} value={recipe} />
        ))}
      </Picker>
      <Picker
        selectedValue={scalingMode}
        onValueChange={(itemValue) => setScalingMode(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Scale by Portion" value="portion" />
        <Picker.Item label="Scale by Availability" value="availability" />
      </Picker>
      {scalingMode === 'portion' ? (
        <TextInput
          style={styles.input}
          placeholder="Scale Factor (e.g., 0.5, 2)"
          keyboardType="numeric"
          onChangeText={(text) => setScaleFactor(parseFloat(text))}
        />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Ingredient Name"
            onChangeText={(text) => setAvailability((prev) => ({ ...prev, ingredient: text }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Available Weight"
            keyboardType="numeric"
            onChangeText={(text) => setAvailability((prev) => ({ ...prev, weight: parseFloat(text) }))}
          />
        </>
      )}
      <Button title="Scale Recipe" onPress={scaleRecipe} />
      {scaledIngredients.length > 0 && (
        <View style={styles.result}>
          <Text style={styles.subtitle}>Scaled Ingredients:</Text>
          {scaledIngredients.map((ing, index) => (
            <Text key={index}>
              {ing.name}: {ing.scaledWeight} {ing.unit}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  picker: { height: 50, marginBottom: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 20, borderRadius: 5 },
  result: { marginTop: 20 },
  subtitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
