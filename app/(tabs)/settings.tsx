import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLibrary } from '@/contexts/LibraryContext';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { books, removeBook } = useLibrary();

  const clearLibrary = () => {
    Alert.alert('Clear library?', 'This removes imported books from Liber. Your original files stay on the device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await Promise.all(books.filter((book) => !book.isSample).map((book) => removeBook(book.id)));
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top + 26, paddingBottom: insets.bottom + 90 }]}>
      <View style={styles.content}>
        <Text style={[styles.wordmark, { color: colors.foreground }]}>Liber</Text>
        <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>SETTINGS</Text>

        <View style={[styles.intro, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>A quiet place to read.</Text>
          <Text style={[styles.copy, { color: colors.mutedForeground }]}>
            Your library lives on this device. No accounts, sync, or tracking.
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SUPPORTED FORMATS</Text>
        <View style={styles.formatGrid}>
          {['EPUB', 'PDF', 'MOBI', 'CBZ', 'TXT'].map((format) => (
            <View key={format} style={[styles.formatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={format === 'PDF' ? 'file-text' : 'book'} size={17} color={colors.foreground} />
              <Text style={[styles.formatName, { color: colors.foreground }]}>{format}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 30 }]}>LIBRARY</Text>
        <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>Books on this device</Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{books.length} titles</Text>
          </View>
          <Feather name="hard-drive" size={19} color={colors.mutedForeground} />
        </View>
        <Pressable
          testID="clear-library"
          onPress={clearLibrary}
          style={({ pressed }) => [styles.settingRow, { borderBottomColor: colors.border, opacity: pressed ? 0.55 : 1 }]}
        >
          <View>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>Clear imported books</Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>Sample books will stay</Text>
          </View>
          <Feather name="trash-2" size={19} color={colors.mutedForeground} />
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL('https://github.com')}
          style={({ pressed }) => [styles.about, { opacity: pressed ? 0.55 : 1 }]}
        >
          <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>Liber · made for one reader</Text>
          <Feather name="arrow-up-right" size={15} color={colors.mutedForeground} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 30 },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.7 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, marginTop: 4 },
  intro: { paddingVertical: 34, borderBottomWidth: 1 },
  title: { fontFamily: 'Inter_600SemiBold', fontSize: 27, letterSpacing: -0.8 },
  copy: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, maxWidth: 420, marginTop: 10 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.3, marginBottom: 12 },
  formatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  formatCard: { width: 105, height: 78, borderWidth: 1, borderRadius: 9, padding: 12, justifyContent: 'space-between' },
  formatName: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  settingRow: { minHeight: 68, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingTitle: { fontFamily: 'Inter_500Medium', fontSize: 14 },
  settingSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 4 },
  about: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 30 },
  aboutText: { fontFamily: 'Inter_400Regular', fontSize: 12 },
});