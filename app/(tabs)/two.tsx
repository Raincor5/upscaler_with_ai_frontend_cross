import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRecipeContext } from '@/context/RecipeContext';

export default function TabTwoScreen() {
  const { fetchRecipes } = useRecipeContext(); // Access fetchRecipes from the global context
  const [photo, setPhoto] = useState<string | null>(null);

  const handleUploadFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Selected file:', result.assets[0].uri);
      const compressedUri = await compressImage(result.assets[0].uri);
      setPhoto(compressedUri);
      console.log('Ready to upload:', compressedUri);
    }
  };

  const handleTakePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take pictures.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Captured image:', result.assets[0].uri);
      const compressedUri = await compressImage(result.assets[0].uri);
      setPhoto(compressedUri);
      console.log('Ready to upload:', compressedUri);
    }
  };

  const compressImage = async (uri: string): Promise<string> => {
    try {
      console.log('Compressing image...');
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1024 } }], // Resize to max width of 1024px
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% quality
      );
      console.log('Compressed image URI:', result.uri);
      return result.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      Alert.alert('Error', 'Failed to compress the image.');
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!photo) {
      Alert.alert('No Photo', 'Please select or capture a photo first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: photo,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      console.log('Uploading photo...');
      const response = await fetch('https://6000-2a0a-ef40-254-8701-4c28-d852-59c8-f8b1.ngrok-free.app/api/process-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to upload photo: ${errorText}`);
      }

      const data = await response.json();
      Alert.alert('Success', `Recipe processed: ${data.recipe.name}`);
      console.log('Server response:', data);

      // Fetch the updated list of recipes after successful upload
      await fetchRecipes();
    } catch (error) {
      console.error('Error during upload:', error);
      Alert.alert('Error', 'Failed to upload the image and process the recipe.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Recipes</Text>

      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="Upload File" onPress={handleUploadFile} color="#007bff" />
        </View>
        <View style={styles.button}>
          <Button title="Take a Picture" onPress={handleTakePicture} color="#28a745" />
        </View>
      </View>

      {photo && (
        <View style={styles.previewContainer}>
          <Text style={styles.subtitle}>Preview:</Text>
          <Image source={{ uri: photo }} style={styles.preview} />
          <Button title="Upload and Process" onPress={handleUpload} color="#ff5722" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 120,
  },
  button: {
    marginBottom: 20,
    width: 200,
  },
  previewContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});
