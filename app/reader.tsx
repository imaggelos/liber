import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Reader as EpubReader } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import Pdf from 'react-native-pdf';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLibrary } from '@/contexts/LibraryContext';
import { useColors } from '@/hooks/useColors';

export default function ReaderScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { books, updateProgress } = useLibrary();
  const [fontSize, setFontSize] = useState(18);
  const [readerError, setReaderError] = useState(false);
  const book = books.find((item) => item.id === id) ?? books[0];
  const readingLabel = useMemo(() => `${Math.round((book?.progress ?? 0) * 100)}% complete`, [book?.progress]);

  if (!book) return null;
  const isNativeReadable = !!book.uri && (book.format === 'EPUB' || book.format === 'PDF');

  const markProgress = async () => {
    await Haptics.selectionAsync();
    await updateProgress(book.id, book.progress > 0.85 ? 0 : Math.min(book.progress + 0.1, 1));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}> 
      <View style={[styles.toolbar, { paddingTop: insets.top + 12, borderBottomColor: colors.border }]}> 
        <Pressable onPress={() => router.back()} style={styles.iconButton} accessibilityLabel="Back to library"><Feather name="arrow-left" size={21} color={colors.foreground} /></Pressable>
        <View style={styles.toolbarTitle}><Text numberOfLines={1} style={[styles.toolbarBook, { color: colors.foreground }]}>{book.title}</Text><Text style={[styles.toolbarMeta, { color: colors.mutedForeground }]}>{book.format} · {readingLabel}</Text></View>
        <Pressable onPress={markProgress} style={styles.iconButton} accessibilityLabel="Mark reading progress"><Feather name="bookmark" size={20} color={colors.foreground} /></Pressable>
      </View>
      {readerError ? (
        <View style={styles.unsupported}><Feather name="alert-circle" size={28} color={colors.mutedForeground} /><Text style={[styles.unsupportedTitle, { color: colors.foreground }]}>This book could not be opened</Text><Text style={[styles.unsupportedCopy, { color: colors.mutedForeground }]}>The file may be incomplete or unsupported. Try importing it again.</Text></View>
      ) : book.format === 'PDF' && book.uri ? (
        <Pdf source={{ uri: book.uri }} style={styles.pdf} trustAllCerts={false} enablePaging onLoadComplete={() => setReaderError(false)} onPageChanged={(page, total) => updateProgress(book.id, total > 1 ? (page - 1) / (total - 1) : 1)} onError={() => setReaderError(true)} />
      ) : book.format === 'EPUB' && book.uri ? (
        <EpubReader
          src={book.uri}
          width="100%"
          height="100%"
          flow="scrolled"
          manager="continuous"
          fileSystem={useFileSystem}
          onLocationChange={(_, __, progress) => updateProgress(book.id, progress)}
          onDisplayError={() => setReaderError(true)}
          defaultTheme={{ body: { color: colors.foreground, background: colors.background, fontSize: `${fontSize}px`, lineHeight: '1.6' } }}
        />
      ) : (
        <View style={styles.unsupported}><Feather name="file-text" size={28} color={colors.mutedForeground} /><Text style={[styles.unsupportedTitle, { color: colors.foreground }]}>This format needs another reader</Text><Text style={[styles.unsupportedCopy, { color: colors.mutedForeground }]}>Liber currently reads EPUB and PDF files inside the app.</Text></View>
      )}
      {isNativeReadable ? <View style={[styles.controls, { backgroundColor: colors.background, borderTopColor: colors.border }]}><Text style={[styles.controlLabel, { color: colors.mutedForeground }]}>TEXT SIZE</Text><Pressable onPress={() => setFontSize((value) => Math.max(15, value - 1))} style={[styles.sizeButton, { borderColor: colors.border }]}><Text style={{ color: colors.foreground }}>A</Text></Pressable><Text style={[styles.sizeValue, { color: colors.mutedForeground }]}>{fontSize}</Text><Pressable onPress={() => setFontSize((value) => Math.min(26, value + 1))} style={[styles.sizeButton, { borderColor: colors.border }]}><Text style={[styles.largeA, { color: colors.foreground }]}>A</Text></Pressable><Pressable onPress={markProgress} style={[styles.progressButton, { backgroundColor: colors.foreground }]}><Text style={{ color: colors.primaryForeground }}>Mark progress</Text></Pressable></View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 }, pdf: { flex: 1, width: '100%', backgroundColor: '#111' }, toolbar: { minHeight: 70, borderBottomWidth: 1, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 12 }, iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' }, toolbarTitle: { flex: 1, alignItems: 'center' }, toolbarBook: { fontFamily: 'Inter_600SemiBold', fontSize: 14, maxWidth: 420 }, toolbarMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 }, unsupported: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }, unsupportedTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 17, marginTop: 16 }, unsupportedCopy: { fontFamily: 'Inter_400Regular', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 8 }, controls: { minHeight: 62, borderTopWidth: 1, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 9 }, controlLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1, marginRight: 6 }, sizeButton: { width: 30, height: 30, borderWidth: 1, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }, largeA: { fontSize: 17 }, sizeValue: { minWidth: 18, textAlign: 'center', fontSize: 12 }, progressButton: { marginLeft: 'auto', minHeight: 36, paddingHorizontal: 13, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }, });
