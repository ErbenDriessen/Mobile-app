import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Melding } from '@/types/melding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MailComposer from 'expo-mail-composer';

interface MeldingBewerkenProps {
  melding: Melding;
  onSave: () => void;
  onCancel: () => void;
}

export function MeldingBewerken({ melding, onSave, onCancel }: MeldingBewerkenProps) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [description, setDescription] = useState(melding.description);
  const [location] = useState(melding.location);
  const [category, setCategory] = useState(melding.category);
  const [monteurName, setMonteurName] = useState(melding.monteurName);
  const [image] = useState(melding.image);

  const handleOpslaan = async () => {
    const bijgewerkteMelding: Melding = {
      ...melding,
      description,
      location,
      category,
      monteurName,
      timestamp: Date.now(),
    };

    try {
      const opgeslagenMeldingen = await AsyncStorage.getItem('meldingen');
      let meldingen = opgeslagenMeldingen ? JSON.parse(opgeslagenMeldingen) : [];
      
      meldingen = meldingen.map((m: Melding) => 
        m.id === melding.id ? bijgewerkteMelding : m
      );

      await AsyncStorage.setItem('meldingen', JSON.stringify(meldingen));
      onSave();
    } catch (error) {
      console.error('Fout bij het opslaan van de melding:', error);
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
        <Text style={styles.title}>Defect Bewerken</Text>

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
                <Button title="Opslaan" onPress={handleOpslaan} />
              </View>
              <View style={styles.buttonSpacing}>
                <Button title="Verstuur per e-mail" onPress={sendEmail} />
              </View>
              <View style={styles.buttonSpacing}>
                <Button title="Annuleren" onPress={onCancel} />
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