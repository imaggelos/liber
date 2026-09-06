import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Book, useLibrary } from '@/contexts/LibraryContext';
import { useColors } from '@/hooks/useColors';

function FormatPill({ format }: { format: Book['format'] }) {
  const colors = useColors();
  return (
    <View style={[styles.formatPill, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.formatText, { color: colors.foreground }]}>{format}</Text>
    </View>
  );
}

function BookRow({ book, onPress }: { book: Book; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable testID={`book-${book.id}`} onPress={onPress} style={({ pressed }) => [styles.bookRow, { borderBottomColor: colors.border, opacity: pressed ? 0.65 : 1 }]}>
      <View style={[styles.bookMark, { backgroundColor: book.isSample ? colors.foreground : colors.secondary }]}>
        <Feather name="book-open" size={21} color={book.isSample ? colors.primaryForeground : colors.foreground} />
      </View>
      <View style={styles.bookCopy}>
        <Text numberOfLines={1} style={[styles.bookTitle, { color: colors.foreground }]}>{book.title}</Text>
        <Text numberOfLines={1} style={[styles.bookAuthor, { color: colors.mutedForeground }]}>{book.author}</Text>
        <View style={styles.rowMeta}>
          <FormatPill format={book.format} />
          {book.progress > 0 ? <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{Math.round(book.progress * 100)}% read</Text> : null}
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export default function LibraryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { books, isLoaded, importBooks } = useLibrary();
  const [query, setQuery] = useState('');
  const isTablet = width >= 700;
  const filteredBooks = useMemo(() => books.filter((book) => `${book.title} ${book.author}`.toLowerCase().includes(query.trim().toLowerCase())), [books, query]);
  const inProgress = books.find((book) => book.progress > 0) ?? books[0];

  if (!isLoaded) {
    return <View style={[styles.loading, { backgroundColor: colors.background }]}><ActivityIndicator color={colors.foreground} /></View>;
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredBooks}
        key={isTablet ? 'tablet-list' : 'phone-list'}
        numColumns={isTablet ? 2 : 1}
        keyExtractor={(item) => item.id}
        scrollEnabled={filteredBooks.length > 0}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 96, maxWidth: 1180 }]}
        columnWrapperStyle={isTablet ? styles.column : undefined}
        ListHeaderComponent={
          <View style={styles.headerArea}>
            <View style={styles.topLine}>
              <View>
                <Text style={[styles.wordmark, { color: colors.foreground }]}>Liber</Text>
                <Text style={[styles.eyebrow, { color: colors.mutedForeground }]}>YOUR PRIVATE LIBRARY</Text>
              </View>
              <Pressable testID="import-books" accessibilityLabel="Import books" onPress={importBooks} style={({ pressed }) => [styles.importButton, { backgroundColor: colors.foreground, opacity: pressed ? 0.72 : 1 }]}>
                <Feather name="plus" size={18} color={colors.primaryForeground} />
                <Text style={[styles.importLabel, { color: colors.primaryForeground }]}>Import</Text>
              </Pressable>
            </View>
            <View style={styles.titleRow}>
              <Text style={[styles.pageTitle, { color: colors.foreground }]}>Library</Text>
              <Text style={[styles.count, { color: colors.mutedForeground }]}>{books.length} books</Text>
            </View>
            {inProgress ? (
              <Pressable testID="continue-reading" onPress={() => router.push({ pathname: '/reader', params: { id: inProgress.id } })} style={({ pressed }) => [styles.continueCard, { backgroundColor: colors.foreground, opacity: pressed ? 0.88 : 1 }]}>
                <View style={styles.continueText}>
                  <Text style={[styles.continueEyebrow, { color: colors.mutedForeground }]}>{inProgress.progress > 0 ? 'CONTINUE READING' : 'START READING'}</Text>
                  <Text numberOfLines={2} style={[styles.continueTitle, { color: colors.primaryForeground }]}>{inProgress.title}</Text>
                  <Text style={[styles.continueAuthor, { color: colors.mutedForeground }]}>{inProgress.author}</Text>
                  <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.max(inProgress.progress * 100, 3)}%`, backgroundColor: colors.primaryForeground }]} /></View>
                </View>
                <View style={[styles.continueIcon, { borderColor: colors.mutedForeground }]}><Feather name="arrow-up-right" size={24} color={colors.primaryForeground} /></View>
              </Pressable>
            ) : null}
            <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={18} color={colors.mutedForeground} />
              <TextInput testID="library-search" placeholder="Search your library" placeholderTextColor={colors.mutedForeground} value={query} onChangeText={setQuery} style={[styles.searchInput, { color: colors.foreground }]} returnKeyType="search" />
              {query ? <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search"><Feather name="x" size={17} color={colors.mutedForeground} /></Pressable> : null}
            </View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ALL BOOKS</Text>
          </View>
        }
        renderItem={({ item }) => <BookRow book={item} onPress={() => router.push({ pathname: '/reader', params: { id: item.id } })} />}
        ListEmptyComponent={<View style={styles.empty}><Feather name="search" size={25} color={colors.mutedForeground} /><Text style={[styles.emptyTitle, { color: colors.foreground }]}>No books found</Text><Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>Try a different title or author.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { width: '100%', alignSelf: 'center', paddingHorizontal: 28 },
  headerArea: { width: '100%' },
  topLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  wordmark: { fontFamily: 'Inter_700Bold', fontSize: 24, letterSpacing: -0.7 },
  eyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 1.4, marginTop: 4 },
  importButton: { minHeight: 44, paddingHorizontal: 17, borderRadius: 22, flexDirection: 'row', alignItems: 'center', gap: 8 },
  importLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 45, marginBottom: 16 },
  pageTitle: { fontFamily: 'Inter_700Bold', fontSize: 32, letterSpacing: -1.1 },
  count: { fontFamily: 'Inter_400Regular', fontSize: 14 },
  continueCard: { minHeight: 172, borderRadius: 16, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  continueText: { flex: 1, maxWidth: 440 },
  continueEyebrow: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.2 },
  continueTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 24, lineHeight: 29, letterSpacing: -0.5, marginTop: 12 },
  continueAuthor: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 7 },
  progressTrack: { height: 3, backgroundColor: '#3b3b3b', marginTop: 22, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 3, borderRadius: 3 },
  continueIcon: { width: 44, height: 44, borderWidth: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 16 },
  searchBox: { height: 48, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14 },
  sectionLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 10, letterSpacing: 1.3, marginTop: 30, marginBottom: 9 },
  column: { gap: 28 },
  bookRow: { flex: 1, minHeight: 92, borderBottomWidth: 1, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 14, marginRight: 28 },
  bookMark: { width: 58, height: 62, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bookCopy: { flex: 1, minWidth: 0 },
  bookTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 15 },
  bookAuthor: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 5 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 9 },
  formatPill: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  formatText: { fontFamily: 'Inter_600SemiBold', fontSize: 9, letterSpacing: 0.6 },
  progressText: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: 48, paddingBottom: 80 },
  emptyTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 16, marginTop: 16 },
  emptyCopy: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 6 },
});
