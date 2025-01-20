import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRecipeContext } from '@/context/RecipeContext';

export default function RecipeScaler() {
  const { recipes, fetchRecipes } = useRecipeContext();
  const [selectedRecipe, setSelectedRecipe] = useState<string | undefined>(undefined);
  const [activeMode, setActiveMode] = useState<'portion' | 'availability'>('portion');
  const [scaleFactor, setScaleFactor] = useState(1);
  const [availability, setAvailability] = useState({ ingredient: '', weight: 0, unit: '' });
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
    if (activeMode === 'availability' && (!availability.ingredient || !availability.unit)) {
      return alert('Please select an ingredient and a unit.');
    }

    setLoading(true);
    const payload = {
      recipe: selectedRecipe,
      scalingMode: activeMode,
      parameter:
        activeMode === 'portion'
          ? { desiredPortion: scaleFactor }
          : {
              availableIngredientName: availability.ingredient,
              availableWeight: availability.weight,
              availableUnit: availability.unit,
            },
    };

    console.log('Scaling API Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch('https://6000-2a0a-ef40-254-8701-4c28-d852-59c8-f8b1.ngrok-free.app/api/scale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Scaling failed.');

      const data = await response.json();
      console.log('Scaling API Response:', JSON.stringify(data, null, 2));
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
        </View>
      );
    }

    if (activeMode === 'availability') {
      const selectedRecipeData = recipes.find((recipe) => recipe._id === selectedRecipe);
      const ingredients = selectedRecipeData?.ingredients || [];

      return (
        <View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ingredient Name:</Text>
            <Picker
              selectedValue={availability.ingredient}
              onValueChange={(itemValue) =>
                setAvailability((prev) => ({ ...prev, ingredient: itemValue }))
              }
              style={styles.picker}
            >
              <Picker.Item label="Select an Ingredient" value={undefined} />
              {ingredients.map((ingredient, index) => (
                <Picker.Item key={index} label={ingredient.name} value={ingredient.name} />
              ))}
            </Picker>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Available Weight:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Available Weight"
              placeholderTextColor="#777"
              keyboardType="numeric"
              onChangeText={(text) =>
                setAvailability((prev) => ({ ...prev, weight: parseFloat(text) }))
              }
            />
          </View>

          <View style={styles.unitContainer}>
            <Text style={styles.label}>Unit:</Text>
            <ScrollView horizontal contentContainerStyle={styles.unitScroll}>
              {['grams', 'ml', 'pieces'].map((unit) => (
                <Pressable
                  key={unit}
                  style={[styles.unitButton, availability.unit === unit && styles.unitButtonActive]}
                  onPress={() => setAvailability((prev) => ({ ...prev, unit }))}
                >
                  <Text
                    style={[styles.unitText, availability.unit === unit && styles.unitTextActive]}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <Pressable style={styles.primaryButton} onPress={scaleRecipe}>
            <Text style={styles.buttonText}>Scale Recipe</Text>
          </Pressable>
        </View>
      );
    }

    return null;
  };

  const renderScaledIngredients = () => {
    if (scaledIngredients.length === 0) return null;

    return (
      <View style={styles.resultContainer}>
        <Text style={styles.subtitle}>Scaled Ingredients:</Text>
        {scaledIngredients.map((ingredient, index) => (
          <View key={index} style={styles.ingredientItem}>
            <Text style={styles.ingredientText}>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>: {ingredient.scaledWeight.toFixed(2)}{' '}
              {ingredient.unit}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Recipe Scaler</Text>

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

      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Select a Recipe:</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <Picker
            selectedValue={selectedRecipe}
            onValueChange={(itemValue) => {
              setSelectedRecipe(itemValue);
              setAvailability({ ingredient: '', weight: 0, unit: '' });
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a Recipe" value={undefined} />
            {recipes.map((recipe) => (
              <Picker.Item key={recipe._id} label={recipe.name} value={recipe._id} />
            ))}
          </Picker>
        )}
      </View>

      {renderModeContent()}
      {renderScaledIngredients()}
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
  unitContainer: {
    marginBottom: 20,
  },
  unitScroll: {
    flexDirection: 'row',
    gap: 10,
  },
  unitButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 5,
    backgroundColor: '#1e1e1e',
  },
  unitButtonActive: {
    backgroundColor: '#4CAF50',
  },
  unitText: {
    color: '#ffffff',
    fontSize: 16,
  },
  unitTextActive: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  ingredientItem: {
    padding: 10,
    marginBottom: 5,
    backgroundColor: '#2e2e2e',
    borderRadius: 5,
  },
  ingredientText: {
    color: '#ffffff',
    fontSize: 16,
  },
  ingredientName: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
