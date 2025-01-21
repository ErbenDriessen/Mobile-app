import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button, ScrollView, Platform, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import { Picker } from '@react-native-picker/picker';

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [category, setCategory] = useState('Grondkabels');
  const [monteurName, setMonteurName] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }
    })();
  }, []);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }
  };

  const sendEmail = async () => {
    if (!image || !description || !location || !monteurName) {
      alert('Vul alle velden in voordat u de melding verstuurt.');
      return;
    }

    const locationStr = `Latitude: ${location.coords.latitude}, Longitude: ${location.coords.longitude}`;
    const body = `
      Monteur: ${monteurName}
      Categorie: ${category}
      Beschrijving: ${description}
      Locatie: ${locationStr}
    `;

    const options = {
      attachments: [image],
      subject: `Defect melding - ${category}`,
      body: body,
    };

    try {
      await MailComposer.composeAsync(options);
    } catch (error) {
      alert('Er is een fout opgetreden bij het versturen van de e-mail.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>GeoFoto</Text>

        <View style={[styles.formContainer, isLandscape && styles.landscapeContainer]}>
          <View style={[styles.inputSection, isLandscape && styles.landscapeInputSection]}>
            <View style={styles.centeredContent}>
              <TextInput
                style={styles.input}
                placeholder="Naam monteur"
                value={monteurName}
                onChangeText={setMonteurName}
              />

              <View style={styles.pickerContainer}>
                <Text style={styles.label}>Kabel categorie:</Text>
                <Picker
                  selectedValue={category}
                  style={styles.picker}
                  onValueChange={(itemValue: string) => setCategory(itemValue)}>
                  <Picker.Item label="Grondkabels" value="Grondkabels" />
                  <Picker.Item label="Hoogspanningsmasten" value="Hoogspanningsmasten" />
                  <Picker.Item label="Luchtkabels" value="Luchtkabels" />
                  <Picker.Item label="Schakelkasten" value="Schakelkasten" />
                </Picker>
              </View>
            </View>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Beschrijving van het defect"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            {location && (
              <Text style={styles.location}>
                Locatie: {location.coords.latitude}, {location.coords.longitude}
              </Text>
            )}

            <View style={styles.buttonContainer}>
              <View style={styles.buttonSpacing}>
                <Button title="Maak foto" onPress={takePhoto} />
              </View>
              <View style={styles.buttonSpacing}>
                <Button title="Verstuur per e-mail" onPress={sendEmail} />
              </View>
            </View>
          </View>

          <View style={[styles.imageSection, isLandscape && styles.landscapeImageSection]}>
            {image && <Image source={{ uri: image }} style={styles.image} />}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  picker: {
    height: 50,
    marginBottom: -10,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 10,
  },
  descriptionInput: {
    height: 100,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    textAlignVertical: 'top',
  },
  location: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  landscapeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputSection: {
    flex: 1,
  },
  landscapeInputSection: {
    flex: 2,
    marginRight: 10,
  },
  imageSection: {
    flex: 1,
  },
  landscapeImageSection: {
    flex: 1,
    marginLeft: 10,
  },
  buttonSpacing: {
    marginTop: 20,
  },
  centeredContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginTop: 10,
  },
});
