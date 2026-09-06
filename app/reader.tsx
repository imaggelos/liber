import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Book, useLibrary } from '@/contexts/LibraryContext';
import { useColors } from '@/hooks/useColors';

const sampleText = [
  'The room was long and narrow, with a window at either end. In the quiet between one sentence and the next, the light moved across the page.',
  'A reader needs very little: a place to sit, a little time protected from the day, and the freedom to follow a thought wherever it leads.',
  'Books are not only records of other minds. They are invitations. They make a small, private room inside the mind, and leave the door open.',
];

export default function ReaderScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { books, updateProgress } = useLibrary();
  const [fontSize, setFontSize] = useState(18);
  const book = books.find((item) => item.id === id) ?? books[0];
  const isImported = !!book?.uri && !book.isSample;
  const readableWidth = Math.min(width - 52, 790);
  const readingLabel = useMemo(() => (book?.progress ? `${Math.round(book.progress * 100)}% complete` : 'Beginning'), [book?.progress]);

  if (!book) return null;

  const markProgress = async (value: number) => {
    await Haptics.selectionAsync();
    await updateProgress(book.id, value);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 16, borderBottomColor: colors.border }]}>
        <Pressable testID="reader-back" onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Back to library">
          <Feather name="arrow-left" size={21} color={colors.foreground} />
        </Pressable>
        <View style={styles.toolbarTitle}>
          <Text numberOfLines={1} style={[styles.toolbarBook, { color: colors.foreground }]}>{book.title}</Text>
          <Text style={[styles.toolbarMeta, { color: colors.mutedForeground }]}>{book.format} · {readingLabel}</Text>
        </View>
        <Pressable
          testID="reader-bookmark"
          onPress={() => Haptics.selectionAsync()}
          style={styles.iconButton}
          accessibilityLabel="Bookmark page"
        >
          <Feather name="bookmark" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.readerContent, { paddingBottom: insets.bottom + 108, width: readableWidth, alignSelf: 'center' }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.chapterHeading}>
          <Text style={[styles.kicker, { color: colors.mutedForeground }]}>CHAPTER ONE</Text>
          <Text style={[styles.chapterTitle, { color: colors.foreground }]}>
            {isImported ? 'Your next chapter' : 'The opening'}
          </Text>
        </View>

        {isImported ? (
          <View style={[styles.importedNotice, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="file" size={20} color={colors.foreground} />
            <View style={styles.noticeCopy}>
              <Text style={[styles.noticeTitle, { color: colors.foreground }]}>Ready to open</Text>
              <Text style={[styles.noticeBody, { color: colors.mutedForeground }]}>
                This {book.format} is saved in your local library. Open it with the device’s compatible reader.
              </Text>
              <Pressable
                testID="open-imported-book"
                onPress={() => book.uri && Linking.openURL(book.uri)}
                style={({ pressed }) => [styles.openButton, { backgroundColor: colors.foreground, opacity: pressed ? 0.7 : 1 }]}
              >
                <Text style={[styles.openButtonText, { color: colors.primaryForeground }]}>Open file</Text>
                <Feather name="external-link" size={15} color={colors.primaryForeground} />
              </Pressable>
            </View>
          </View>
        ) : (
          <View>
            {sampleText.map((paragraph, index) => (
              <Text key={paragraph} style={[styles.paragraph, { color: colors.foreground, fontSize, lineHeight: fontSize * 1.65 }]}>
                {index === 0 ? '    ' : ''}{paragraph}
              </Text>
            ))}
            <Text style={[styles.paragraph, { color: colors.foreground, fontSize, lineHeight: fontSize * 1.65 }]}>
              {'    '}A good book does not ask to be hurried. It asks only that we return, and then return again, until the last page feels like a beginning of its own.
            </Text>
          </View>
        )}

        <View style={[styles.readerControls, { borderTopColor: colors.border }]}>
          <Text style={[styles.controlLabel, { color: colors.mutedForeground }]}>READING SIZE</Text>
          <View style={styles.sizeControls}>
            <Pressable onPress={() => setFontSize((current) => Math.max(15, current - 1))} style={[styles.sizeButton, { borderColor: colors.border }]}>
              <Text style={[styles.smallA, { color: colors.foreground }]}>A</Text>
            </Pressable>
            <Text style={[styles.sizeValue, { color: colors.mutedForeground }]}>{fontSize}</Text>
            <Pressable onPress={() => setFontSize((current) => Math.min(24, current + 1))} style={[styles.sizeButton, { borderColor: colors.border }]}>
              <Text style={[styles.largeA, { color: colors.foreground }]}>A</Text>
            </Pressable>
          </View>
          <Pressable
            testID="mark-progress"
            onPress={() => markProgress(book.progress > 0.85 ? 0 : Math.min(book.progress + 0.1, 1))}
            style={({ pressed }) => [styles.progressButton, { backgroundColor: colors.foreground, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.progressButtonText, { color: colors.primaryForeground }]}>
              {book.progress > 0.85 ? 'Start over' : 'Mark next section'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  toolbar: { minHeight: 74, borderBottomWidth: 1, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  toolbarTitle: { flex: 1, alignItems: 'center' },
  toolbarBook: { fontFamily: 'Inter_600SemiBold', fontSize: 14, maxWidth: 410 },
  toolbarMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 4 },
  readerContent: { paddingTop: 58, paddingHorizontal: 26 },
  chapterHeading: { alignItems: 'center', marginBottom: 38 },
  kicker: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.4 },
  chapterTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.1, marginTop: 10, textAlign: 'center' },
  paragraph: { fontFamily: 'Inter_400Regular', marginBottom: 23 },
  importedNotice: { borderWidth: 1, borderRadius: 12, padding: 20, flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  noticeCopy: { flex: 1 },
  noticeTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  noticeBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 20, marginTop: 8 },
  openButton: { alignSelf: 'flex-start', paddingHorizontal: 14, minHeight: 38, borderRadius: 19, flexDirection: 'row', gap: 7, alignItems: 'center', marginTop: 16 },
  openButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  readerControls: { borderTopWidth: 1, marginTop: 46, paddingTop: 20, flexDirection: 'row', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  controlLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.2 },
  sizeControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sizeButton: { width: 32, height: 32, borderWidth: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  smallA: { fontFamily: 'Inter_400Regular', fontSize: 12 },
  largeA: { fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  sizeValue: { fontFamily: 'Inter_400Regular', fontSize: 12, minWidth: 18, textAlign: 'center' },
  progressButton: { minHeight: 38, paddingHorizontal: 15, borderRadius: 19, marginLeft: 'auto' },
  progressButtonText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
});