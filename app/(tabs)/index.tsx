import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { Snackbar } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Recipe } from '@/types/recipe';
import { router } from 'expo-router';
import { useRecipeContext } from '@/context/RecipeContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function RecipePreview() {
  const { recipes, fetchRecipes, setRecipes } = useRecipeContext();
  const [refreshing, setRefreshing] = useState(false);
  const [deletedRecipe, setDeletedRecipe] = useState<Recipe | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleDelete = async (id: string) => {
    const recipeToDelete = recipes.find((r) => r._id === id);
    if (!recipeToDelete) return;

    setDeletedRecipe(recipeToDelete);
    setRecipes((prev) => prev.filter((recipe) => recipe._id !== id));
    setSnackbarVisible(true);

    try {
      const response = await fetch(
        `https://6000-2a0a-ef40-254-8701-4c28-d852-59c8-f8b1.ngrok-free.app/api/recipes/${id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete recipe.');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const handleUndo = async () => {
    if (!deletedRecipe) return;

    try {
      const response = await fetch('https://6000-2a0a-ef40-254-8701-4c28-d852-59c8-f8b1.ngrok-free.app/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deletedRecipe),
      });

      if (!response.ok) {
        throw new Error('Failed to restore recipe.');
      }

      setRecipes((prev) => [deletedRecipe, ...prev]);
      setDeletedRecipe(null);
    } catch (error) {
      console.error('Error restoring recipe:', error);
    }
    setSnackbarVisible(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  const handleRecipeClick = (recipe: Recipe | undefined | null) => {
    // Log the recipe data for debugging
    console.log('Selected Recipe:', recipe);
    if (!recipe) {
      Alert.alert('Error', 'Invalid recipe data.');
      return;
    }

    router.push({
      pathname: '/recipe-detail',
      params: { recipe: JSON.stringify(recipe) }, // Ensure this matches RootStackParamList
    });
  };

  const renderSwipeRight = () => (
    <View style={[styles.swipeAction, styles.swipeRight]}>
      <Text style={styles.swipeText}>Scale</Text>
    </View>
  );

  const renderSwipeLeft = () => (
    <View style={[styles.swipeAction, styles.swipeLeft]}>
      <Text style={styles.swipeText}>Delete</Text>
    </View>
  );

  const renderRecipe = ({ item, drag }: { item: Recipe; drag: () => void }) => (
    <Swipeable
      renderLeftActions={renderSwipeRight}
      renderRightActions={renderSwipeLeft}
      onSwipeableRightOpen={() => handleDelete(item._id)}
      friction={2} // Reduce sensitivity
      overshootLeft={false}
      overshootRight={false}
    >
      <TouchableOpacity
        onPress={() => handleRecipeClick(item)}
        onLongPress={drag}
        style={styles.recipeCard}
      >
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.portion}>Portion: {item.originalPortion}</Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.title}>Recipe Preview</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes available.</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh and load recipes.</Text>
          </View>
        ) : (
          <DraggableFlatList
            data={recipes}
            keyExtractor={(item) => item._id}
            onDragEnd={({ data }) => setRecipes(data)}
            renderItem={renderRecipe}
          />
        )}
      </ScrollView>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        action={{
          label: 'Undo',
          onPress: handleUndo,
        }}
      >
        Recipe deleted.
      </Snackbar>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  recipeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    height: 100,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  portion: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 5,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.3,
    height: 100, // Matches card height
  },
  swipeRight: {
    backgroundColor: '#28a745',
  },
  swipeLeft: {
    backgroundColor: '#dc3545',
  },
  swipeText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#b0b0b0',
    textAlign: 'center',
  },
});
