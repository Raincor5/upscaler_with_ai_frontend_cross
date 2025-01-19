import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Pressable } from 'react-native';
import { useRecipeContext } from '@/context/RecipeContext';

export default function RecipeScaler() {
  const { recipes, fetchRecipes } = useRecipeContext();
  const [selectedRecipe, setSelectedRecipe] = useState<string | undefined>(undefined);
  const [activeMode, setActiveMode] = useState<'portion' | 'availability'>('portion');
  const [scaleFactor, setScaleFactor] = useState(1);
  const [availability, setAvailability] = useState({ ingredient: '', weight: 0 });
  const [scaledIngredients, setScaledIngredients] = useState<ScaledIngredient[]>([]);
  const [loading, setLoading] = useState(false);

  type ScaledIngredient = {
    name: string;
    scaledWeight: number;
    unit: string;
  };

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const scaleRecipe = async () => {
    if (!selectedRecipe) return alert('Please select a recipe.');

    setLoading(true);
    const payload = {
      recipe: selectedRecipe,
      scalingMode: activeMode,
      parameter:
        activeMode === 'portion'
          ? { desiredPortion: scaleFactor }
          : { availableIngredientName: availability.ingredient, availableWeight: availability.weight },
    };

    console.log('Scaling API Payload:', JSON.stringify(payload, null, 2)); // Debug payload

    try {
      const response = await fetch('http://192.168.1.185:5000/api/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Scaling failed.');

      const data = await response.json();
      console.log('Scaling API Response:', JSON.stringify(data, null, 2)); // Debug API response
      setScaledIngredients(data.scaledIngredients || []);
    } catch (error) {
      console.error('Error scaling recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderModeContent = () => {
    if (activeMode === 'portion') {
      return (
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Scale Factor:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Scale Factor (e.g., 0.5, 2)"
              placeholderTextColor="#777"
              keyboardType="numeric"
              onChangeText={(text) => setScaleFactor(parseFloat(text))}
            />
            <Pressable style={styles.primaryButton} onPress={scaleRecipe}>
              <Text style={styles.buttonText}>Scale Recipe</Text>
            </Pressable>
          </View>

          {scaledIngredients.length > 0 &&
            scaledIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>: {ingredient.scaledWeight.toFixed(2)}{' '}
                  {ingredient.unit}
                </Text>
              </View>
            ))}
        </View>
      );
    }

    if (activeMode === 'availability') {
      return (
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ingredient Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Ingredient Name"
              placeholderTextColor="#777"
              onChangeText={(text) => setAvailability((prev) => ({ ...prev, ingredient: text }))}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Weight (in grams):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Available Weight"
              placeholderTextColor="#777"
              keyboardType="numeric"
              onChangeText={(text) => setAvailability((prev) => ({ ...prev, weight: parseFloat(text) }))}
            />
          </View>
          <Pressable style={styles.primaryButton} onPress={scaleRecipe}>
            <Text style={styles.buttonText}>Scale Recipe</Text>
          </Pressable>

          {scaledIngredients.length > 0 &&
            scaledIngredients.map((ingredient, index) => (
              <View key={index} style={styles.ingredientItem}>
                <Text style={styles.ingredientText}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>: {ingredient.scaledWeight.toFixed(2)}{' '}
                  {ingredient.unit}
                </Text>
              </View>
            ))}
        </View>
      );
    }

    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recipe Scaler</Text>

      {/* Segmented Control for Modes */}
      <View style={styles.segmentedControl}>
        <Pressable
          style={[styles.segment, activeMode === 'portion' && styles.activeSegment]}
          onPress={() => setActiveMode('portion')}
        >
          <Text style={[styles.segmentText, activeMode === 'portion' && styles.activeSegmentText]}>Portion</Text>
        </Pressable>
        <Pressable
          style={[styles.segment, activeMode === 'availability' && styles.activeSegment]}
          onPress={() => setActiveMode('availability')}
        >
          <Text style={[styles.segmentText, activeMode === 'availability' && styles.activeSegmentText]}>
            Availability
          </Text>
        </Pressable>
      </View>

      {/* Recipe Picker */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select a Recipe:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <Picker
            selectedValue={selectedRecipe}
            onValueChange={(itemValue) => setSelectedRecipe(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select a Recipe" value={undefined} />
            {recipes.map((recipe) => (
              <Picker.Item key={recipe._id} label={recipe.name} value={recipe._id} />
            ))}
          </Picker>
        )}
      </View>

      {/* Render Content Based on Mode */}
      {renderModeContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    margin: 0,
    backgroundColor: '#121212',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#1e1e1e',
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  activeSegment: {
    backgroundColor: '#4CAF50',
  },
  segmentText: {
    color: '#777',
    fontWeight: 'bold',
  },
  activeSegmentText: {
    color: '#ffffff',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  picker: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    padding: 10,
    borderRadius: 5,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  ingredientItem: {
    backgroundColor: '#1e1e1e',
    padding: 10,
    marginBottom: 5,
    borderRadius: 5,
  },
  ingredientText: {
    fontSize: 16,
    color: '#ffffff',
  },
  ingredientName: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
