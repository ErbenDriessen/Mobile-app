import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import type { LocationObject } from 'expo-location';
import { MeldingBewerken } from '../../components/MeldingBewerken';
import { Melding } from '@/types/melding';
import { useScreenPadding } from '@/hooks/useScreenPadding';

export default function MeldingenScreen() {
  const [meldingen, setMeldingen] = useState<Melding[]>([]);
  const [geselecteerdeMelding, setGeselecteerdeMelding] = useState<Melding | null>(null);
  const [bewerkModus, setBewerkModus] = useState(false);
  const router = useRouter();
  const padding = useScreenPadding();

  useEffect(() => {
    laadMeldingen();
  }, []);

  const laadMeldingen = async () => {
    try {
      const opgeslagenMeldingen = await AsyncStorage.getItem('meldingen');
      if (opgeslagenMeldingen) {
        const parsedMeldingen = JSON.parse(opgeslagenMeldingen);
        setMeldingen(parsedMeldingen.sort((a: Melding, b: Melding) => b.timestamp - a.timestamp));
      }
    } catch (error) {
      console.error('Fout bij het laden van meldingen:', error);
    }
  };

  const handleMeldingSelect = (melding: Melding) => {
    setGeselecteerdeMelding(melding);
    setBewerkModus(true);
  };

  const handleBewerkCancel = () => {
    setGeselecteerdeMelding(null);
    setBewerkModus(false);
  };

  const handleBewerkSave = () => {
    setBewerkModus(false);
    setGeselecteerdeMelding(null);
    laadMeldingen(); // Herlaad de lijst met meldingen
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('nl-NL');
  };

  const deleteMelding = async (id: string) => {
    Alert.alert(
      'Melding verwijderen',
      'Weet u zeker dat u deze melding wilt verwijderen?',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Verwijderen',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMeldingen = meldingen.filter(melding => melding.id !== id);
              await AsyncStorage.setItem('meldingen', JSON.stringify(updatedMeldingen));
              setMeldingen(updatedMeldingen);
            } catch (error) {
              console.error('Fout bij verwijderen van melding:', error);
            }
          },
        },
      ]
    );
  };

  const renderMelding = ({ item }: { item: Melding }) => (
    <TouchableOpacity onPress={() => handleMeldingSelect(item)}>
      <View style={styles.meldingCard}>
        <Image source={{ uri: item.image }} style={styles.thumbnail} />
        <View style={styles.meldingInfo}>
          <Text style={styles.monteur}>Monteur: {item.monteurName}</Text>
          <Text style={styles.category}>{item.category}</Text>
          <Text numberOfLines={2} style={styles.description}>{item.description}</Text>
          <Text style={styles.location}>
            Locatie: {item.location.coords.latitude.toFixed(6)}, {item.location.coords.longitude.toFixed(6)}
          </Text>
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteMelding(item.id)}>
          <Text style={styles.deleteButtonText}>×</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { padding }]}>
      <Text style={styles.title}>Opgeslagen meldingen</Text>
      {bewerkModus && geselecteerdeMelding ? (
        <MeldingBewerken
          melding={geselecteerdeMelding}
          onSave={handleBewerkSave}
          onCancel={handleBewerkCancel}
        />
      ) : (
        <FlatList
          data={meldingen}
          keyExtractor={(item) => item.id}
          renderItem={renderMelding}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  meldingItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  meldingTitel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  meldingLocatie: {
    fontSize: 14,
    color: '#666',
  },
  meldingDatum: {
    fontSize: 12,
    color: '#999',
  },
  meldingCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    position: 'relative',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  meldingInfo: {
    flex: 1,
    marginLeft: 10,
  },
  category: {
    fontSize: 14,
  },
  monteur: {
    fontSize: 14,
    color: '#666',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    marginBottom: 5,
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
}); 