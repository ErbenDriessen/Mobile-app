import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, Button, ScrollView, Platform, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import type { LocationObject } from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Melding } from '@/types/melding';
import { useScreenPadding } from '@/hooks/useScreenPadding';

export default function App() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [category, setCategory] = useState('Grondkabels');
  const [monteurName, setMonteurName] = useState('');
  const padding = useScreenPadding();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Toestemming voor toegang tot locatie is geweigerd');
        return;
      }
    })();
  }, []);

  // Laad opgeslagen meldingen bij het opstarten
  useEffect(() => {
    loadSavedMeldingen();
  }, []);

  const loadSavedMeldingen = async () => {
    try {
      const savedMeldingen = await AsyncStorage.getItem('meldingen');
      if (savedMeldingen) {
        console.log('Opgeslagen meldingen:', JSON.parse(savedMeldingen));
      }
    } catch (error) {
      console.error('Fout bij laden van meldingen:', error);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we hebben toestemming nodig voor het gebruik van de camera!');
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

  const saveMelding = async () => {
    if (!image || !description || !location || !monteurName) {
      alert('Vul alle velden in, neem een foto en wacht op de locatiegegevens voordat u de melding opslaat.');
      return;
    }

    try {
      // Haal bestaande meldingen op
      const savedMeldingen = await AsyncStorage.getItem('meldingen');
      const meldingen: Melding[] = savedMeldingen ? JSON.parse(savedMeldingen) : [];

      // Maak nieuwe melding
      const newMelding: Melding = {
        id: Date.now().toString(),
        image,
        description,
        location,
        category,
        monteurName,
        timestamp: Date.now(),
      };

      // Voeg nieuwe melding toe aan array
      meldingen.push(newMelding);

      // Sla bijgewerkte array op
      await AsyncStorage.setItem('meldingen', JSON.stringify(meldingen));

      // Reset formulier
      setImage(null);
      setDescription('');
      setLocation(null);
      setMonteurName('');
      
      alert('Het defect is opgeslagen op de telefoon.');
    } catch (error) {
      alert('Er is een fout opgetreden bij het opslaan van het defect.');
      console.error(error);
    }
  };

  const sendEmail = async () => {
    if (!image || !description || !location || !monteurName) {
      alert('Vul alle velden in, maak en foto en wacht op de locatiegegevens, voordat u de melding verstuurt.');
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
    <ScrollView style={[styles.container, { padding }]}>
      <View style={styles.content}>
        <Text style={styles.title}>Nieuw defect opnemen</Text>

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
              <View style={styles.locationContainer}>
                <Text style={styles.label}>Locatie:</Text>
                <Text style={styles.location}>
                  {location.coords.latitude}, {location.coords.longitude}
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <View style={styles.buttonSpacing}>
                <Button title="Maak foto" onPress={takePhoto} />
              </View>
              <View style={styles.buttonSpacing}>
                <Button title="Opslaan" onPress={saveMelding} />
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
  locationContainer: {
    marginBottom: 10,
  },
});
